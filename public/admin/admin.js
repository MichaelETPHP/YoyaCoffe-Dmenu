document.addEventListener('DOMContentLoaded', init);

// Global variables
let currentUser = null;
let token = null;
let allMenuItems = [];
let allCategories = [];
let allUsers = [];
let categoryItemCounts = {};

// Init function
async function init() {
  // Set current date
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }
  
  // Setup UI event listeners
  setupUI();
  
  // Check if user is already logged in
  await checkAuth();
}

async function checkAuth() {
  // Check for token in localStorage
  token = localStorage.getItem('yoyaAdminToken');
  
  if (token) {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        currentUser = await response.json();
        showDashboard();
      } else {
        // Token invalid or expired
        localStorage.removeItem('yoyaAdminToken');
        token = null;
        showLoginScreen();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }
}

function setupUI() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
          const data = await response.json();
          token = data.token;
          currentUser = data.user;
          
          // Store token in localStorage
          localStorage.setItem('yoyaAdminToken', token);
          
          showDashboard();
        } else {
          document.getElementById('login-error').classList.remove('hidden');
        }
      } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-error').classList.remove('hidden');
      }
    });
  }
  
  // User dropdown
  const userMenuButton = document.getElementById('user-menu-button');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (userMenuButton && userDropdown) {
    userMenuButton.addEventListener('click', () => {
      userDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });
  }
  
  // Logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await fetch('/api/logout', { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Clear token and user data
        localStorage.removeItem('yoyaAdminToken');
        token = null;
        currentUser = null;
        
        showLoginScreen();
      } catch (error) {
        console.error('Logout error:', error);
        showToast('Error logging out', 'error');
      }
    });
  }
  
  // Sidebar toggle (mobile)
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });
  }
  
  // Navigation links
  const navLinks = document.querySelectorAll('.sidebar-link');
  if (navLinks.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show the corresponding page
        const pageId = link.getAttribute('data-page');
        showPage(pageId);
      });
    });
  }
  
  // Close modals
  const closeModalButtons = document.querySelectorAll('.close-modal');
  if (closeModalButtons.length > 0) {
    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('[id$="-modal"]');
        if (modal) modal.classList.add('hidden');
      });
    });
  }
  
  // Setup forms
  setupMenuItemForm();
  setupCategoryForm();
  setupUserForm();
  
  // Setup action buttons
  setupActionButtons();
}

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('dashboard').classList.add('hidden');
  
  // Clear any previous login errors
  const loginError = document.getElementById('login-error');
  if (loginError) loginError.classList.add('hidden');
  
  // Clear form fields
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
}

async function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').classList.remove('hidden');
  
  // Update user info
  const userInitials = document.getElementById('user-initials');
  const dropdownUsername = document.getElementById('dropdown-username');
  
  if (currentUser && userInitials) {
    userInitials.textContent = currentUser.username.charAt(0).toUpperCase();
  }
  
  if (currentUser && dropdownUsername) {
    dropdownUsername.textContent = currentUser.username;
  }
  
  // Load dashboard data
  await Promise.all([
    loadMenuItems(),
    loadCategories(),
    loadUsers()
  ]);
  
  // Calculate stats
  updateDashboardStats();
  
  // Populate popular items table
  populatePopularItemsTable();
  
  // Show the default page (dashboard overview)
  showPage('dashboard-overview');
}

function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(page => {
    page.classList.add('hidden');
  });
  
  // Show the requested page
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.remove('hidden');
  }
  
  // Close sidebar on mobile
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth < 768 && sidebar && !sidebar.classList.contains('hidden')) {
    sidebar.classList.add('hidden');
  }
}

function setupActionButtons() {
  // Add menu item button
  const addMenuItemBtn = document.getElementById('add-menu-item-btn');
  if (addMenuItemBtn) {
    addMenuItemBtn.addEventListener('click', () => {
      showMenuItemModal();
    });
  }
  
  // Add category button
  const addCategoryBtn = document.getElementById('add-category-btn');
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      showCategoryModal();
    });
  }
  
  // Add user button
  const addUserBtn = document.getElementById('add-user-btn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      showUserModal();
    });
  }
  
  // Confirm modal buttons
  const confirmCancel = document.getElementById('confirm-cancel');
  const confirmDelete = document.getElementById('confirm-delete');
  
  if (confirmCancel) {
    confirmCancel.addEventListener('click', () => {
      document.getElementById('confirm-modal').classList.add('hidden');
    });
  }
  
  if (confirmDelete) {
    confirmDelete.addEventListener('click', () => {
      const deleteFunction = confirmDelete.getAttribute('data-delete-function');
      const itemId = confirmDelete.getAttribute('data-item-id');
      
      if (deleteFunction && itemId) {
        // Call the appropriate delete function dynamically
        if (deleteFunction === 'deleteMenuItem') {
          deleteMenuItem(parseInt(itemId));
        } else if (deleteFunction === 'deleteCategory') {
          deleteCategory(parseInt(itemId));
        } else if (deleteFunction === 'deleteUser') {
          deleteUser(parseInt(itemId));
        }
      }
      
      document.getElementById('confirm-modal').classList.add('hidden');
    });
  }
  
  // Menu search
  const menuSearch = document.getElementById('menu-search');
  if (menuSearch) {
    menuSearch.addEventListener('input', () => {
      renderMenuItems();
    });
  }
  
  // Menu category filter
  const menuCategoryFilter = document.getElementById('menu-category-filter');
  if (menuCategoryFilter) {
    menuCategoryFilter.addEventListener('change', () => {
      renderMenuItems();
    });
  }
}

function setupMenuItemForm() {
  const form = document.getElementById('menu-item-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('menu-item-id').value;
    const name = document.getElementById('menu-item-name').value;
    const description = document.getElementById('menu-item-description').value;
    const price = document.getElementById('menu-item-price').value;
    const categoryId = parseInt(document.getElementById('menu-item-category').value);
    const image = document.getElementById('menu-item-image').value;
    const featured = document.getElementById('menu-item-featured').checked;
    
    const menuItem = { name, description, price, categoryId, image, featured };
    
    try {
      let response;
      
      if (id) {
        // Update existing item
        response = await fetch(`/api/menu/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(menuItem)
        });
      } else {
        // Create new item
        response = await fetch('/api/menu', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(menuItem)
        });
      }
      
      if (response.ok) {
        const item = await response.json();
        
        // Update local data
        const existingItemIndex = allMenuItems.findIndex(i => i.id === item.id);
        if (existingItemIndex >= 0) {
          allMenuItems[existingItemIndex] = item;
        } else {
          allMenuItems.push(item);
        }
        
        // Update UI
        document.getElementById('menu-item-modal').classList.add('hidden');
        renderMenuItems();
        updateDashboardStats();
        
        // Show success message
        showToast(id ? 'Menu item updated successfully' : 'Menu item created successfully');
      } else {
        showToast('Error saving menu item', 'error');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      showToast('Error saving menu item', 'error');
    }
  });
}

function setupCategoryForm() {
  const form = document.getElementById('category-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    
    try {
      let response;
      
      if (id) {
        // Update existing category
        response = await fetch(`/api/categories/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name })
        });
      } else {
        // Create new category
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name })
        });
      }
      
      if (response.ok) {
        const category = await response.json();
        
        // Update local data
        await loadCategories(); // Reload all categories
        
        // Update UI
        document.getElementById('category-modal').classList.add('hidden');
        renderCategories();
        updateCategoryFilters();
        
        // Show success message
        showToast(id ? 'Category updated successfully' : 'Category created successfully');
      } else {
        showToast('Error saving category', 'error');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Error saving category', 'error');
    }
  });
}

function setupUserForm() {
  const form = document.getElementById('user-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('user-id').value;
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;
    const isAdmin = document.getElementById('user-is-admin').checked;
    
    try {
      let response;
      
      // Currently we only support creating new users
      response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, isAdmin })
      });
      
      if (response.ok) {
        const user = await response.json();
        
        // Update local data
        await loadUsers(); // Reload all users
        
        // Update UI
        document.getElementById('user-modal').classList.add('hidden');
        renderUsers();
        
        // Show success message
        showToast('User created successfully');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Error saving user', 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('Error saving user', 'error');
    }
  });
}

async function loadMenuItems() {
  try {
    const response = await fetch('/api/menu');
    if (response.ok) {
      allMenuItems = await response.json();
      
      // Update UI
      renderMenuItems();
    } else {
      console.error('Failed to load menu items');
      showToast('Failed to load menu items', 'error');
    }
  } catch (error) {
    console.error('Error loading menu items:', error);
    showToast('Error loading menu items', 'error');
  }
}

function renderMenuItems() {
  const container = document.getElementById('menu-items-table');
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  // Apply filtering
  let filteredItems = [...allMenuItems];
  
  // Category filter
  const categoryFilter = document.getElementById('menu-category-filter');
  if (categoryFilter && categoryFilter.value !== 'all') {
    filteredItems = filteredItems.filter(item => item.category_id == categoryFilter.value);
  }
  
  // Search filter
  const searchInput = document.getElementById('menu-search');
  if (searchInput && searchInput.value.trim() !== '') {
    const searchTerm = searchInput.value.toLowerCase().trim();
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) || 
      item.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filteredItems.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-4 text-center text-gray-500">
          No menu items found
        </td>
      </tr>
    `;
    return;
  }
  
  // Create and append table rows
  filteredItems.forEach(item => {
    const categoryName = allCategories.find(c => c.id === item.category_id)?.name || 'Uncategorized';
    
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-amber-50 transition-colors duration-200';
    
    tr.innerHTML = `
      <td class="px-6 py-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 flex-shrink-0">
            <img src="${item.image}" alt="${item.name}" class="w-10 h-10 rounded-full object-cover">
          </div>
          <div>
            <div class="font-medium text-gray-900">${item.name}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">${categoryName}</td>
      <td class="px-6 py-4">$${parseFloat(item.price).toFixed(2)}</td>
      <td class="px-6 py-4">
        <div class="flex items-center">
          <span>${item.likes || 0}</span>
          <span class="text-red-400 ml-1">❤️</span>
        </div>
      </td>
      <td class="px-6 py-4">
        ${item.featured ? 
          '<span class="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Featured</span>' : 
          ''
        }
      </td>
      <td class="px-6 py-4 text-right">
        <div class="flex space-x-2 justify-end">
          <button class="edit-menu-item text-amber-600 hover:text-amber-900" data-id="${item.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button class="delete-menu-item text-red-600 hover:text-red-900" data-id="${item.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
    `;
    
    // Add event listeners
    tr.querySelector('.edit-menu-item').addEventListener('click', () => {
      showMenuItemModal(item.id);
    });
    
    tr.querySelector('.delete-menu-item').addEventListener('click', () => {
      showConfirmDeleteModal('menu item', item.name, item.id, 'deleteMenuItem');
    });
    
    container.appendChild(tr);
  });
}

async function loadCategories() {
  try {
    const response = await fetch('/api/categories');
    if (response.ok) {
      allCategories = await response.json();
      
      // Calculate item counts
      categoryItemCounts = {};
      allMenuItems.forEach(item => {
        if (item.category_id) {
          categoryItemCounts[item.category_id] = (categoryItemCounts[item.category_id] || 0) + 1;
        }
      });
      
      // Update UI
      renderCategories();
      updateCategoryFilters();
    } else {
      console.error('Failed to load categories');
      showToast('Failed to load categories', 'error');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    showToast('Error loading categories', 'error');
  }
}

function renderCategories() {
  const container = document.getElementById('categories-table');
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  if (allCategories.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-4 text-center text-gray-500">
          No categories found
        </td>
      </tr>
    `;
    return;
  }
  
  // Create and append table rows
  allCategories.forEach(category => {
    const itemCount = categoryItemCounts[category.id] || 0;
    
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-amber-50 transition-colors duration-200';
    
    tr.innerHTML = `
      <td class="px-6 py-4 font-medium text-gray-900">${category.name}</td>
      <td class="px-6 py-4">${itemCount}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex space-x-2 justify-end">
          <button class="edit-category text-amber-600 hover:text-amber-900" data-id="${category.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button class="delete-category text-red-600 hover:text-red-900" data-id="${category.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
    `;
    
    // Add event listeners
    tr.querySelector('.edit-category').addEventListener('click', () => {
      showCategoryModal(category.id);
    });
    
    tr.querySelector('.delete-category').addEventListener('click', () => {
      showConfirmDeleteModal('category', category.name, category.id, 'deleteCategory');
    });
    
    container.appendChild(tr);
  });
}

function updateCategoryFilters() {
  // Update category dropdown in menu item form
  const categorySelect = document.getElementById('menu-item-category');
  if (categorySelect) {
    // Save current selection
    const currentSelection = categorySelect.value;
    
    // Clear current options
    categorySelect.innerHTML = '';
    
    // Add categories
    allCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
    
    // Restore selection if possible
    if (currentSelection && allCategories.some(c => c.id == currentSelection)) {
      categorySelect.value = currentSelection;
    }
  }
  
  // Update category filter in menu items table
  const categoryFilter = document.getElementById('menu-category-filter');
  if (categoryFilter) {
    // Save current selection
    const currentSelection = categoryFilter.value;
    
    // Clear current options
    categoryFilter.innerHTML = '';
    
    // Add "All Categories" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categoryFilter.appendChild(allOption);
    
    // Add categories
    allCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });
    
    // Restore selection if possible
    if (currentSelection && (currentSelection === 'all' || allCategories.some(c => c.id == currentSelection))) {
      categoryFilter.value = currentSelection;
    } else {
      categoryFilter.value = 'all';
    }
  }
}

async function loadUsers() {
  // Only load users if the current user is an admin
  if (!currentUser || !currentUser.is_admin) {
    return;
  }
  
  try {
    const response = await fetch('/api/users');
    if (response.ok) {
      allUsers = await response.json();
      
      // Update UI
      renderUsers();
    } else {
      console.error('Failed to load users');
      showToast('Failed to load users', 'error');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    showToast('Error loading users', 'error');
  }
}

function renderUsers() {
  const container = document.getElementById('users-table');
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  if (allUsers.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-4 text-center text-gray-500">
          No users found
        </td>
      </tr>
    `;
    return;
  }
  
  // Create and append table rows
  allUsers.forEach(user => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-amber-50 transition-colors duration-200';
    
    // Format creation date
    const createdDate = new Date(user.created_at);
    const formattedDate = createdDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    tr.innerHTML = `
      <td class="px-6 py-4 font-medium text-gray-900">${user.username}</td>
      <td class="px-6 py-4">
        ${user.is_admin ? 
          '<span class="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Admin</span>' : 
          '<span class="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">User</span>'
        }
      </td>
      <td class="px-6 py-4">${formattedDate}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex space-x-2 justify-end">
          <button class="delete-user text-red-600 hover:text-red-900" data-id="${user.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
    `;
    
    // Add event listeners
    tr.querySelector('.delete-user').addEventListener('click', () => {
      // Check if this is the current user
      if (user.id === currentUser.id) {
        showToast('You cannot delete your own account', 'error');
        return;
      }
      
      showConfirmDeleteModal('user', user.username, user.id, 'deleteUser');
    });
    
    container.appendChild(tr);
  });
}

function showMenuItemModal(itemId = null) {
  const modal = document.getElementById('menu-item-modal');
  const modalTitle = document.getElementById('menu-modal-title');
  const form = document.getElementById('menu-item-form');
  const idInput = document.getElementById('menu-item-id');
  const nameInput = document.getElementById('menu-item-name');
  const descriptionInput = document.getElementById('menu-item-description');
  const priceInput = document.getElementById('menu-item-price');
  const categoryInput = document.getElementById('menu-item-category');
  const imageInput = document.getElementById('menu-item-image');
  const featuredInput = document.getElementById('menu-item-featured');
  
  // Reset form
  form.reset();
  idInput.value = '';
  
  // Set title based on mode (add or edit)
  modalTitle.textContent = itemId ? 'Edit Menu Item' : 'Add Menu Item';
  
  // If editing, populate form with item data
  if (itemId) {
    const item = allMenuItems.find(i => i.id === itemId);
    if (item) {
      idInput.value = item.id;
      nameInput.value = item.name;
      descriptionInput.value = item.description;
      priceInput.value = item.price;
      categoryInput.value = item.category_id || '';
      imageInput.value = item.image;
      featuredInput.checked = item.featured;
    }
  }
  
  // Show modal
  modal.classList.remove('hidden');
}

function showCategoryModal(categoryId = null) {
  const modal = document.getElementById('category-modal');
  const modalTitle = document.getElementById('category-modal-title');
  const form = document.getElementById('category-form');
  const idInput = document.getElementById('category-id');
  const nameInput = document.getElementById('category-name');
  
  // Reset form
  form.reset();
  idInput.value = '';
  
  // Set title based on mode (add or edit)
  modalTitle.textContent = categoryId ? 'Edit Category' : 'Add Category';
  
  // If editing, populate form with category data
  if (categoryId) {
    const category = allCategories.find(c => c.id === categoryId);
    if (category) {
      idInput.value = category.id;
      nameInput.value = category.name;
    }
  }
  
  // Show modal
  modal.classList.remove('hidden');
}

function showUserModal() {
  const modal = document.getElementById('user-modal');
  const form = document.getElementById('user-form');
  
  // Reset form
  form.reset();
  
  // Show modal
  modal.classList.remove('hidden');
}

function showConfirmDeleteModal(itemType, itemName, itemId, deleteFunction) {
  const modal = document.getElementById('confirm-modal');
  const modalTitle = document.getElementById('confirm-modal-title');
  const modalMessage = document.getElementById('confirm-modal-message');
  const confirmDeleteBtn = document.getElementById('confirm-delete');
  
  // Set modal content
  modalTitle.textContent = `Confirm Delete`;
  modalMessage.textContent = `Are you sure you want to delete the ${itemType} "${itemName}"? This action cannot be undone.`;
  
  // Set data attributes for the delete button
  confirmDeleteBtn.setAttribute('data-delete-function', deleteFunction);
  confirmDeleteBtn.setAttribute('data-item-id', itemId);
  
  // Show modal
  modal.classList.remove('hidden');
}

async function deleteMenuItem(itemId) {
  try {
    const response = await fetch(`/api/menu/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      // Remove item from local array
      allMenuItems = allMenuItems.filter(item => item.id !== itemId);
      
      // Update UI
      renderMenuItems();
      updateDashboardStats();
      
      // Show success message
      showToast('Menu item deleted successfully');
    } else {
      // Try to get error message from response
      const errorData = await response.json().catch(() => ({ message: 'Error deleting menu item' }));
      showToast(errorData.message || 'Error deleting menu item', 'error');
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    showToast('Error deleting menu item', 'error');
  }
}

async function deleteCategory(categoryId) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      // Remove category from local array
      allCategories = allCategories.filter(category => category.id !== categoryId);
      
      // Update UI
      renderCategories();
      updateCategoryFilters();
      
      // Show success message
      showToast('Category deleted successfully');
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Error deleting category' }));
      showToast(errorData.message || 'Error deleting category', 'error');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    showToast('Error deleting category', 'error');
  }
}

async function deleteUser(userId) {
  // This functionality is not implemented in the API
  showToast('User deletion is not implemented', 'error');
}

function updateDashboardStats() {
  // Update stats on dashboard
  const totalMenuItems = document.getElementById('total-menu-items');
  const totalCategories = document.getElementById('total-categories');
  const totalLikes = document.getElementById('total-likes');
  
  if (totalMenuItems) {
    totalMenuItems.textContent = allMenuItems.length;
  }
  
  if (totalCategories) {
    totalCategories.textContent = allCategories.length;
  }
  
  if (totalLikes) {
    const likes = allMenuItems.reduce((total, item) => total + (item.likes || 0), 0);
    totalLikes.textContent = likes;
  }
}

function populatePopularItemsTable() {
  const table = document.getElementById('popular-items-table');
  if (!table) return;
  
  // Clear table
  table.innerHTML = '';
  
  // Sort items by likes (descending)
  const sortedItems = [...allMenuItems].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  
  // Take top 5 items
  const topItems = sortedItems.slice(0, 5);
  
  if (topItems.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-3 text-center text-gray-500">
          No menu items found
        </td>
      </tr>
    `;
    return;
  }
  
  // Add rows
  topItems.forEach(item => {
    const categoryName = allCategories.find(c => c.id === item.category_id)?.name || 'Uncategorized';
    
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-amber-50 transition-colors duration-200';
    
    tr.innerHTML = `
      <td class="px-4 py-3 font-medium text-gray-900">${item.name}</td>
      <td class="px-4 py-3 text-gray-600">${categoryName}</td>
      <td class="px-4 py-3">$${parseFloat(item.price).toFixed(2)}</td>
      <td class="px-4 py-3">
        <div class="flex items-center">
          <span class="font-medium text-amber-700">${item.likes || 0}</span>
          <span class="text-red-400 ml-1">❤️</span>
        </div>
      </td>
      <td class="px-4 py-3 text-gray-600">${item.dislikes || 0}</td>
    `;
    
    table.appendChild(tr);
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  
  if (type === 'error') {
    toast.classList.add('border-red-500');
    toast.classList.remove('border-amber-500');
  } else {
    toast.classList.add('border-amber-500');
    toast.classList.remove('border-red-500');
  }
  
  // Show toast
  toast.classList.remove('translate-y-16', 'opacity-0');
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-16', 'opacity-0');
  }, 3000);
}