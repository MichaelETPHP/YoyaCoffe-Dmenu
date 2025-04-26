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
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Search Results</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each searchResults as item}
                <div class="bg-white rounded-lg shadow-md p-4">
                  <h3 class="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p class="text-gray-600 text-sm mb-2">{item.description}</p>
                  <p class="text-amber-700 font-bold">${item.price.toFixed(2)}</p>
                </div>
              {/each}
            </div>
          </div>
        {:else if searchQuery.trim() && searchResults.length === 0}
          <div class="mt-6 text-center">
            <p class="text-gray-600">No items found matching "{searchQuery}"</p>
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


