<script>
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import MenuCategory from './components/MenuCategory.svelte';
  import Search from './components/Search.svelte';
  import Footer from './components/Footer.svelte';
  import CategoryFilter from './components/CategoryFilter.svelte';
  import MusicPlayer from './components/MusicPlayer.svelte';
  import ModeToggle from './components/ModeToggle.svelte';
  import SplashScreen from './components/SplashScreen.svelte';
  
  let searchQuery = '';
  let searchResults = [];
  let categories = [];
  let menuItems = [];
  let isLoading = true;
  let loadingError = null;
  let activeCategory = null;
  let isMobile = false;
  let currentMode = 'menu';
  let showSplash = true; // Control the splash screen visibility
  
  // Function to fetch all categories from the API
  async function fetchCategories() {
    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/categories?_=${timestamp}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.statusText}`);
      }
      
      // Try to parse the response as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server returned invalid data format. Please try again later.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      loadingError = `Error Loading Categories: ${error.message}`;
      return [];
    }
  }
  
  // Function to fetch all menu items from the API
  async function fetchMenuItems() {
    try {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/menu?_=${timestamp}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load menu items: ${response.statusText}`);
      }
      
      // Try to parse the response as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server returned invalid data format. Please try again later.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      loadingError = `Error Loading Menu: ${error.message}`;
      return [];
    }
  }
  
  // Function to organize menu items by category
  function organizeItemsByCategory(categories, items) {
    return categories.map(category => {
      const categoryItems = items.filter(item => item.categoryId === category.id);
      return {
        ...category,
        id: category.id.toString(), // Ensure ID is a string for component compatibility
        items: categoryItems
      };
    });
  }
  
  // Function to search menu items
  function searchItems(query) {
    if (!query) return [];
    
    const searchTerm = query.toLowerCase();
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) || 
      item.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Handle search query changes
  $: {
    if (searchQuery.trim()) {
      searchResults = searchItems(searchQuery);
    } else {
      searchResults = [];
    }
  }
  
  function handleCategorySelect(event) {
    activeCategory = event.detail.category;
    // Scroll to the selected category if it's not null
    if (activeCategory) {
      const element = document.getElementById(activeCategory);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
  
  function handleModeChange(event) {
    currentMode = event.detail.mode;
  }
  
  // Check for mobile screen on mount and window resize
  onMount(async () => {
    checkMobileScreen();
    window.addEventListener('resize', checkMobileScreen);
    
    // Fetch data from API
    isLoading = true;
    loadingError = null;
    
    try {
      const [categoriesData, menuItemsData] = await Promise.all([
        fetchCategories(),
        fetchMenuItems()
      ]);
      
      menuItems = menuItemsData;
      
      // Organize menu items by category
      categories = organizeItemsByCategory(categoriesData, menuItemsData);
      
      isLoading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      loadingError = error.message;
      isLoading = false;
    }
    
    return () => {
      window.removeEventListener('resize', checkMobileScreen);
    };
  });
  
  function checkMobileScreen() {
    isMobile = window.innerWidth < 768;
  }
</script>

<!-- Splash Screen -->
<SplashScreen duration={2500} />

<div class="min-h-screen flex flex-col bg-amber-50">
  <Header />
  
  <!-- Featured slider removed as requested -->
  
  <main class="flex-1 w-full">
    <div class="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <!-- Sidebar with categories for desktop -->
      {#if !isMobile}
        <aside class="w-full md:w-64 shrink-0">
          <div class="sticky top-4">
            <CategoryFilter 
              categories={categories} 
              activeCategory={activeCategory}
              on:selectCategory={handleCategorySelect} 
            />
          </div>
        </aside>
      {/if}
      
      <div class="flex-1">
        <!-- Search bar -->
        <Search bind:searchQuery />
        
        <!-- Search results -->
        {#if searchQuery.trim() && searchResults.length > 0}
          <div class="mt-6">
            <h2 class="text-2xl font-semibold text-coffee-800 mb-4 font-serif">Search Results</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each searchResults as item}
                <div class="menu-item group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-coffee-100">
                  <!-- Coffee Image -->
                  <div class="w-full h-48 overflow-hidden">
                    <img src={item.image} alt={item.name} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div class="p-5">
                    <div class="flex justify-between items-start">
                      <div class="flex-1 pr-3">
                        <h3 class="font-semibold text-lg text-coffee-800">{item.name}</h3>
                        <p class="text-coffee-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      <!-- Rating display -->
                      <div class="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="ml-1 text-sm font-medium text-coffee-800">{item.rating}</span>
                      </div>
                    </div>
                    <div class="my-4 h-px bg-gradient-to-r from-transparent via-coffee-200 to-transparent"></div>
                    <div class="flex justify-between items-center">
                      <div class="flex flex-col">
                        <span class="text-coffee-800 font-bold text-lg">{item.price} ETB</span>
                      </div>
                      <!-- Rating display at the bottom -->
                      <div class="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="ml-1 text-sm font-medium text-coffee-800">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else if searchQuery.trim() && searchResults.length === 0}
          <div class="mt-6 text-center p-8 bg-white rounded-2xl shadow-soft">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-coffee-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-coffee-600 text-lg">No items found matching "{searchQuery}"</p>
            <p class="text-coffee-400 mt-2">Try a different search term or browse our menu categories</p>
          </div>
        {/if}
        
        <!-- Categories for mobile view -->
        {#if isMobile}
          <div class="mb-6">
            <CategoryFilter 
              categories={categories} 
              activeCategory={activeCategory}
              on:selectCategory={handleCategorySelect} 
              isMobile={true}
            />
          </div>
        {/if}
        
        <!-- Loading, Error, and Menu Categories -->
        {#if !searchQuery.trim()}
          {#if isLoading}
            <div class="py-12 text-center">
              <div class="inline-block relative w-20 h-20">
                <div class="absolute top-0 left-0 w-full h-full">
                  <div class="coffee-loading"></div>
                </div>
                <div class="mt-28 text-coffee-700">Loading menu...</div>
              </div>
            </div>
          {:else if loadingError}
            <div class="mt-8 p-6 bg-white rounded-2xl shadow-md border border-red-100">
              <div class="flex items-center text-red-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="font-medium">Error Loading Menu</h3>
              </div>
              <p class="text-coffee-700 mb-4">{loadingError}</p>
              <button 
                on:click={() => window.location.reload()} 
                class="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
              >
                Retry
              </button>
            </div>
          {:else if categories.length === 0}
            <div class="mt-8 p-8 bg-white rounded-2xl shadow-md text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-coffee-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 class="text-xl font-semibold text-coffee-800 mb-2">No Menu Categories Found</h3>
              <p class="text-coffee-600">Our menu is being updated. Please check back soon!</p>
            </div>
          {:else}
            <div class="space-y-12">
              {#each categories as category}
                <div id={category.id}>
                  <MenuCategory {category} />
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </main>
  
  <Footer />
  
  <!-- Music Player Component -->
  <MusicPlayer />
  
  <!-- Mode Toggle Component -->
  <ModeToggle bind:mode={currentMode} on:modeChange={handleModeChange} />
  
  <!-- Payment mode overlay -->
  {#if currentMode === 'payment'}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all duration-300 animate-fadeIn">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-coffee-800">Payment Options</h2>
          <button 
            on:click={() => currentMode = 'menu'} 
            class="text-coffee-500 hover:text-coffee-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center p-4 bg-coffee-50 rounded-xl">
            <div class="flex-shrink-0 mr-4 bg-coffee-100 p-3 rounded-full">
              <span class="text-2xl">💳</span>
            </div>
            <div>
              <h3 class="font-medium text-coffee-800">Credit/Debit Card</h3>
              <p class="text-coffee-600 text-sm">Pay with any major card</p>
            </div>
          </div>
          
          <div class="flex items-center p-4 bg-coffee-50 rounded-xl">
            <div class="flex-shrink-0 mr-4 bg-coffee-100 p-3 rounded-full">
              <span class="text-2xl">📱</span>
            </div>
            <div class="flex-1">
              <h3 class="font-medium text-coffee-800">Telebirr</h3>
              <p class="text-coffee-600 text-sm">Scan with Telebirr app to pay</p>
            </div>
            <div class="flex-shrink-0 ml-2">
              <img src="/images/payment/telebirr-qr.png" alt="Telebirr QR Code" class="w-24 h-24 rounded-lg border border-coffee-100" />
            </div>
          </div>
          
          <div class="flex items-center p-4 bg-coffee-50 rounded-xl">
            <div class="flex-shrink-0 mr-4 bg-coffee-100 p-3 rounded-full">
              <span class="text-2xl">🏦</span>
            </div>
            <div>
              <h3 class="font-medium text-coffee-800">CBE Money Account</h3>
              <p class="text-coffee-600 text-sm">Account Number: 1000123456789</p>
            </div>
          </div>
          
          <div class="flex items-center p-4 bg-coffee-50 rounded-xl">
            <div class="flex-shrink-0 mr-4 bg-coffee-100 p-3 rounded-full">
              <span class="text-2xl">💵</span>
            </div>
            <div>
              <h3 class="font-medium text-coffee-800">Cash</h3>
              <p class="text-coffee-600 text-sm">Pay in-store with cash</p>
            </div>
          </div>
        </div>
        
        <button 
          on:click={() => currentMode = 'menu'} 
          class="mt-6 w-full py-3 bg-coffee-700 text-white font-medium rounded-xl hover:bg-coffee-800 transition-colors"
        >
          Return to Menu
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Coffee cup loading animation */
  .coffee-loading {
    width: 48px;
    height: 48px;
    margin: auto;
    position: relative;
    border-radius: 50%;
    background: #8B4513; /* Coffee brown color */
    box-shadow: 0 0 0 5px #8B451333;
    overflow: hidden;
  }
  
  .coffee-loading::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 100%;
    height: 0;
    background: #FFFAF0; /* Cream color */
    animation: fillCoffee 2.5s infinite;
    border-radius: 50%;
  }
  
  @keyframes fillCoffee {
    0% {
      height: 0;
    }
    25% {
      height: 40%;
    }
    50% {
      height: 60%;
    }
    75% {
      height: 85%;
    }
    100% {
      height: 0;
    }
  }
</style>
