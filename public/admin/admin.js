// Admin Dashboard JavaScript

// Current authenticated user
let currentUser = null;

// API Base URL - change to production URL when deployed
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.includes('replit')
  ? 'http://localhost:5001' // Use backend server URL in development
  : 'https://menu.yoyacoffee.com';

// Check if user is logged in
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      currentUser = await response.json();
      showAdminDashboard();
      loadDashboardStats();
      return true;
    } else {
      showLoginScreen();
      return false;
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    showLoginScreen();
    return false;
  }
}

// Login functionality
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('login-error');
  
  if (!username || !password) {
    errorElement.textContent = 'Please enter both username and password';
    errorElement.classList.remove('hidden');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      showAdminDashboard();
      loadDashboardStats();
      
      // Clear form
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      errorElement.classList.add('hidden');
    } else {
      const error = await response.json();
      errorElement.textContent = error.error || 'Login failed. Please check your credentials.';
      errorElement.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Login failed:', error);
    errorElement.textContent = 'A network error occurred. Please try again.';
    errorElement.classList.remove('hidden');
  }
});

// Logout functionality
function setupLogout() {
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('mobile-logout-btn').addEventListener('click', logout);
}

async function logout() {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  currentUser = null;
  showLoginScreen();
}

// UI state functions
function showLoginScreen() {
  document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('content-container').classList.add('hidden');
}

function showAdminDashboard() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('content-container').classList.remove('hidden');
}

// Navigation
function setupNavigation() {
  // Desktop navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('data-target');
      showPage(target);
      
      // Highlight active link
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Mobile navigation
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('data-target');
      showPage(target);
      
      // Close mobile menu
      document.getElementById('mobile-sidebar').classList.add('hidden');
    });
  });
  
  // Quick navigation from dashboard
  document.querySelectorAll('.quick-nav').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('data-target');
      showPage(target);
      
      // Highlight active link
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelector(`.nav-link[data-target="${target}"]`).classList.add('active');
    });
  });
  
  // Mobile menu toggle
  document.getElementById('mobile-menu-toggle').addEventListener('click', function() {
    document.getElementById('mobile-sidebar').classList.remove('hidden');
  });
  
  // Mobile menu close
  document.getElementById('mobile-close').addEventListener('click', function() {
    document.getElementById('mobile-sidebar').classList.add('hidden');
  });
}

// Show specific page content
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.add('hidden');
    page.classList.remove('active');
  });
  
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.remove('hidden');
    page.classList.add('active');
    
    // Load data for specific pages
    if (pageId === 'menu') {
      loadMenuItems();
      loadCategoriesForSelect();
    } else if (pageId === 'categories') {
      loadCategories();
    } else if (pageId === 'users') {
      loadUsers();
    } else if (pageId === 'dashboard') {
      loadDashboardStats();
    }
  }
}

// Dashboard stats
async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/stats/dashboard`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const stats = await response.json();
      
      document.getElementById('total-menu-items').textContent = stats.totalMenuItems;
      document.getElementById('total-categories').textContent = stats.totalCategories;
      document.getElementById('total-likes').textContent = stats.totalLikes;
      
      if (stats.mostLikedItem) {
        document.getElementById('most-liked-item').textContent = stats.mostLikedItem.name;
        document.getElementById('most-liked-count').textContent = `${stats.mostLikedItem.likes} likes`;
      } else {
        document.getElementById('most-liked-item').textContent = 'No items yet';
        document.getElementById('most-liked-count').textContent = '';
      }
    } else {
      showToast('Failed to load dashboard statistics', 'error');
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    showToast('Network error while loading statistics', 'error');
  }
}

// Menu Items
async function loadMenuItems() {
  const tableBody = document.getElementById('menu-items-table-body');
  tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Loading menu items...</td></tr>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const menuItems = await response.json();
      
      if (menuItems.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No menu items found</td></tr>';
        return;
      }
      
      tableBody.innerHTML = '';
      menuItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" class="w-10 h-10 rounded-full mr-3 object-cover">` : ''}
              <div>
                <div class="font-medium text-gray-900">${item.name}</div>
                <div class="text-sm text-gray-500">${item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : ''}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800" data-category-id="${item.categoryId}">
              ${item.categoryName}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${item.formattedPrice}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="${item.featured ? 'text-green-600' : 'text-gray-400'}">
              ${item.featured ? '★' : '☆'}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-menu-item" data-id="${item.id}">Edit</button>
            <button class="text-red-600 hover:text-red-900 delete-menu-item" data-id="${item.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
      
      // Setup edit and delete event listeners
      setupMenuItemActions();
      
    } else {
      tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Failed to load menu items</td></tr>';
    }
  } catch (error) {
    console.error('Error loading menu items:', error);
    tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Network error while loading menu items</td></tr>';
  }
}

function setupMenuItemActions() {
  // Edit menu item
  document.querySelectorAll('.edit-menu-item').forEach(button => {
    button.addEventListener('click', async function() {
      const itemId = this.getAttribute('data-id');
      await loadMenuItemForEdit(itemId);
    });
  });
  
  // Delete menu item
  document.querySelectorAll('.delete-menu-item').forEach(button => {
    button.addEventListener('click', function() {
      const itemId = this.getAttribute('data-id');
      showConfirmModal(
        'Delete Menu Item', 
        'Are you sure you want to delete this menu item? This action cannot be undone.',
        () => deleteMenuItem(itemId)
      );
    });
  });
}

// Add menu item button
document.getElementById('add-menu-item-btn').addEventListener('click', function() {
  document.getElementById('menu-item-form').reset();
  document.getElementById('menu-item-id').value = '';
  document.getElementById('menu-item-modal-title').textContent = 'Add Menu Item';
  document.getElementById('menu-item-modal').classList.remove('hidden');
});

// Load menu item for edit
async function loadMenuItemForEdit(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/${itemId}`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const item = await response.json();
      
      document.getElementById('menu-item-id').value = item.id;
      document.getElementById('menu-item-name').value = item.name;
      document.getElementById('menu-item-description').value = item.description || '';
      document.getElementById('menu-item-price').value = (item.price / 100).toFixed(2);
      document.getElementById('menu-item-category').value = item.categoryId;
      document.getElementById('menu-item-image').value = item.image || '';
      document.getElementById('menu-item-featured').checked = item.featured;
      
      document.getElementById('menu-item-modal-title').textContent = 'Edit Menu Item';
      document.getElementById('menu-item-modal').classList.remove('hidden');
    } else {
      showToast('Failed to load menu item details', 'error');
    }
  } catch (error) {
    console.error('Error loading menu item:', error);
    showToast('Network error while loading menu item', 'error');
  }
}

// Save menu item
document.getElementById('menu-item-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('menu-item-name').value,
    description: document.getElementById('menu-item-description').value,
    price: parseFloat(document.getElementById('menu-item-price').value),
    categoryId: document.getElementById('menu-item-category').value,
    image: document.getElementById('menu-item-image').value,
    featured: document.getElementById('menu-item-featured').checked
  };
  
  const itemId = document.getElementById('menu-item-id').value;
  const isEdit = !!itemId;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu${isEdit ? `/${itemId}` : ''}`, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });
    
    if (response.ok) {
      document.getElementById('menu-item-modal').classList.add('hidden');
      loadMenuItems();
      showToast(`Menu item ${isEdit ? 'updated' : 'created'} successfully`);
    } else {
      const error = await response.json();
      showToast(error.error || `Failed to ${isEdit ? 'update' : 'create'} menu item`, 'error');
    }
  } catch (error) {
    console.error(`Error ${isEdit ? 'updating' : 'creating'} menu item:`, error);
    showToast(`Network error while ${isEdit ? 'updating' : 'creating'} menu item`, 'error');
  }
});

// Delete menu item
async function deleteMenuItem(itemId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/${itemId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      loadMenuItems();
      showToast('Menu item deleted successfully');
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed to delete menu item', 'error');
    }
  } catch (error) {
    console.error('Error deleting menu item:', error);
    showToast('Network error while deleting menu item', 'error');
  }
}

// Categories
async function loadCategories() {
  const tableBody = document.getElementById('categories-table-body');
  tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Loading categories...</td></tr>';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/stats/counts`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const categories = await response.json();
      
      if (categories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No categories found</td></tr>';
        return;
      }
      
      tableBody.innerHTML = '';
      categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="font-medium text-gray-900">${category.name}</div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-500">${category.description || ''}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${category.item_count || 0} items
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-category" data-id="${category.id}">Edit</button>
            <button class="text-red-600 hover:text-red-900 delete-category" data-id="${category.id}" ${category.item_count > 0 ? 'disabled title="Cannot delete category with items"' : ''}>
              ${category.item_count > 0 ? '<span class="opacity-50">Delete</span>' : 'Delete'}
            </button>
          </td>
        `;
        tableBody.appendChild(row);
      });
      
      // Setup category actions
      setupCategoryActions();
      
    } else {
      tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Failed to load categories</td></tr>';
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Network error while loading categories</td></tr>';
  }
}

// Load categories for select dropdown
async function loadCategoriesForSelect() {
  const selectElements = [
    document.getElementById('menu-item-category'),
    document.getElementById('category-filter')
  ];
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const categories = await response.json();
      
      selectElements.forEach(select => {
        if (!select) return;
        
        // Clear existing options except the first one
        while (select.options.length > 1) {
          select.remove(1);
        }
        
        // Add new options
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          select.appendChild(option);
        });
      });
    } else {
      showToast('Failed to load categories', 'error');
    }
  } catch (error) {
    console.error('Error loading categories for select:', error);
    showToast('Network error while loading categories', 'error');
  }
}

function setupCategoryActions() {
  // Edit category
  document.querySelectorAll('.edit-category').forEach(button => {
    button.addEventListener('click', async function() {
      const categoryId = this.getAttribute('data-id');
      await loadCategoryForEdit(categoryId);
    });
  });
  
  // Delete category
  document.querySelectorAll('.delete-category').forEach(button => {
    button.addEventListener('click', function() {
      if (this.hasAttribute('disabled')) return;
      
      const categoryId = this.getAttribute('data-id');
      showConfirmModal(
        'Delete Category', 
        'Are you sure you want to delete this category? This action cannot be undone.',
        () => deleteCategory(categoryId)
      );
    });
  });
}

// Add category button
document.getElementById('add-category-btn').addEventListener('click', function() {
  document.getElementById('category-form').reset();
  document.getElementById('category-id').value = '';
  document.getElementById('category-modal-title').textContent = 'Add Category';
  document.getElementById('category-modal').classList.remove('hidden');
});

// Load category for edit
async function loadCategoryForEdit(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const category = await response.json();
      
      document.getElementById('category-id').value = category.id;
      document.getElementById('category-name').value = category.name;
      document.getElementById('category-description').value = category.description || '';
      
      document.getElementById('category-modal-title').textContent = 'Edit Category';
      document.getElementById('category-modal').classList.remove('hidden');
    } else {
      showToast('Failed to load category details', 'error');
    }
  } catch (error) {
    console.error('Error loading category:', error);
    showToast('Network error while loading category', 'error');
  }
}

// Save category
document.getElementById('category-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('category-name').value,
    description: document.getElementById('category-description').value
  };
  
  const categoryId = document.getElementById('category-id').value;
  const isEdit = !!categoryId;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories${isEdit ? `/${categoryId}` : ''}`, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    });
    
    if (response.ok) {
      document.getElementById('category-modal').classList.add('hidden');
      loadCategories();
      loadCategoriesForSelect();
      showToast(`Category ${isEdit ? 'updated' : 'created'} successfully`);
    } else {
      const error = await response.json();
      showToast(error.error || `Failed to ${isEdit ? 'update' : 'create'} category`, 'error');
    }
  } catch (error) {
    console.error(`Error ${isEdit ? 'updating' : 'creating'} category:`, error);
    showToast(`Network error while ${isEdit ? 'updating' : 'creating'} category`, 'error');
  }
});

// Delete category
async function deleteCategory(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      loadCategories();
      loadCategoriesForSelect();
      showToast('Category deleted successfully');
    } else {
      const error = await response.json();
      showToast(error.error || 'Failed to delete category', 'error');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    showToast('Network error while deleting category', 'error');
  }
}

// Users
async function loadUsers() {
  const tableBody = document.getElementById('users-table-body');
  tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Loading users...</td></tr>';
  
  try {
    // This endpoint would need to be implemented in the backend
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const users = await response.json();
      
      if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No users found</td></tr>';
        return;
      }
      
      tableBody.innerHTML = '';
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="font-medium text-gray-900">${user.username}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
              ${user.role}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-user" data-id="${user.id}">Edit</button>
            <button class="text-red-600 hover:text-red-900 delete-user" data-id="${user.id}" ${user.id === currentUser.id ? 'disabled title="Cannot delete your own account"' : ''}>
              ${user.id === currentUser.id ? '<span class="opacity-50">Delete</span>' : 'Delete'}
            </button>
          </td>
        `;
        tableBody.appendChild(row);
      });
      
      // Setup user actions
      setupUserActions();
      
    } else {
      tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Please implement the user management API in the backend</td></tr>';
    }
  } catch (error) {
    console.error('Error loading users:', error);
    tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">User management API not implemented yet</td></tr>';
  }
}

// Add user button 
document.getElementById('add-user-btn').addEventListener('click', function() {
  document.getElementById('user-form').reset();
  document.getElementById('user-id').value = '';
  document.getElementById('user-modal-title').textContent = 'Add User';
  document.getElementById('user-password').required = true;
  document.getElementById('user-modal').classList.remove('hidden');
});

function setupUserActions() {
  // Edit user
  document.querySelectorAll('.edit-user').forEach(button => {
    button.addEventListener('click', async function() {
      const userId = this.getAttribute('data-id');
      await loadUserForEdit(userId);
    });
  });
  
  // Delete user
  document.querySelectorAll('.delete-user').forEach(button => {
    button.addEventListener('click', function() {
      if (this.hasAttribute('disabled')) return;
      
      const userId = this.getAttribute('data-id');
      showConfirmModal(
        'Delete User', 
        'Are you sure you want to delete this user? This action cannot be undone.',
        () => deleteUser(userId)
      );
    });
  });
}

// Initialize modal close buttons
function setupModals() {
  // Close modals when clicking the X or cancel buttons
  document.querySelectorAll('.modal-close').forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('[id$="-modal"]');
      if (modal) modal.classList.add('hidden');
    });
  });
  
  // Close modals when clicking outside the modal content
  document.querySelectorAll('[id$="-modal"]').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.add('hidden');
      }
    });
  });
}

// Confirmation modal
function showConfirmModal(title, message, confirmCallback) {
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-message').textContent = message;
  
  const confirmBtn = document.getElementById('confirm-action-btn');
  
  // Remove existing event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  // Add new event listener
  newConfirmBtn.addEventListener('click', function() {
    document.getElementById('confirm-modal').classList.add('hidden');
    if (typeof confirmCallback === 'function') {
      confirmCallback();
    }
  });
  
  document.getElementById('confirm-modal').classList.remove('hidden');
}

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');
  
  toastMessage.textContent = message;
  
  if (type === 'error') {
    toast.classList.add('bg-red-800');
    toast.classList.remove('bg-gray-800', 'bg-green-800');
    toastIcon.textContent = '✕';
  } else if (type === 'warning') {
    toast.classList.add('bg-yellow-700');
    toast.classList.remove('bg-gray-800', 'bg-green-800', 'bg-red-800');
    toastIcon.textContent = '⚠';
  } else {
    toast.classList.add('bg-green-800');
    toast.classList.remove('bg-gray-800', 'bg-red-800', 'bg-yellow-700');
    toastIcon.textContent = '✓';
  }
  
  // Show toast
  toast.classList.remove('translate-y-full', 'opacity-0');
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
  }, 3000);
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      // Simple client-side filtering - in a real app, this might be server-side
      const query = this.value.toLowerCase();
      const rows = document.querySelectorAll('#menu-items-table-body tr');
      
      rows.forEach(row => {
        const nameCell = row.querySelector('td:first-child');
        if (!nameCell) return;
        
        const name = nameCell.textContent.toLowerCase();
        if (name.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
  
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      const categoryId = this.value;
      
      if (!categoryId) {
        loadMenuItems();
        return;
      }
      
      // In a real app, this would use the API with a query parameter
      // For now, we'll do client-side filtering on the already loaded data
      const rows = document.querySelectorAll('#menu-items-table-body tr');
      
      rows.forEach(row => {
        const categoryCell = row.querySelector('td:nth-child(2)');
        if (!categoryCell) return;
        
        const categoryBadge = categoryCell.querySelector('span');
        if (!categoryBadge) return;
        
        if (categoryBadge.getAttribute('data-category-id') === categoryId) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

// Initialize the admin dashboard
async function init() {
  setupModals();
  setupNavigation();
  setupLogout();
  setupSearch();
  await checkAuth();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);