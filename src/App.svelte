<script>
  import { onMount } from 'svelte';
  import { menuData, searchItems } from './data/menu.js';
  import Header from './components/Header.svelte';
  import MenuCategory from './components/MenuCategory.svelte';
  import Search from './components/Search.svelte';
  import Footer from './components/Footer.svelte';
  import CategoryFilter from './components/CategoryFilter.svelte';
  
  let searchQuery = '';
  let searchResults = [];
  let categories = menuData.categories;
  let activeCategory = null;
  let isMobile = false;
  
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
  
  // Check for mobile screen on mount and window resize
  onMount(() => {
    checkMobileScreen();
    window.addEventListener('resize', checkMobileScreen);
    
    return () => {
      window.removeEventListener('resize', checkMobileScreen);
    };
  });
  
  function checkMobileScreen() {
    isMobile = window.innerWidth < 768;
  }
</script>

<div class="min-h-screen flex flex-col bg-amber-50">
  <Header />
  
  <main class="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
    <div class="flex flex-col md:flex-row gap-6">
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
                        <span class="text-coffee-500 text-xs">Tax included</span>
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
        
        <!-- Menu categories -->
        {#if !searchQuery.trim()}
          <div class="space-y-12">
            {#each categories as category}
              <div id={category.id}>
                <MenuCategory {category} />
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </main>
  
  <Footer />
</div>


