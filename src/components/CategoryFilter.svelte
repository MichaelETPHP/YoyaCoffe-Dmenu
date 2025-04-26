<script>
  import { createEventDispatcher } from 'svelte';
  
  export let categories = [];
  export let activeCategory = null;
  export let isMobile = false;
  
  const dispatch = createEventDispatcher();
  
  function selectCategory(categoryId) {
    dispatch('selectCategory', {
      category: categoryId === activeCategory ? null : categoryId
    });
  }
  
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    dispatch('selectCategory', { category: null });
  }
</script>

{#if isMobile}
  <!-- Mobile horizontal scrolling categories with smooth scrolling -->
  <div class="relative mb-6">
    <!-- Gradient fade on left side -->
    <div class="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-coffee-50 to-transparent z-10 pointer-events-none"></div>
    
    <!-- Scrollable container -->
    <div class="overflow-x-auto py-2 px-1 hide-scrollbar">
      <div class="flex space-x-3 min-w-max px-2">
        <!-- "All" button -->
        <button 
          class="px-5 py-2.5 rounded-xl text-sm whitespace-nowrap font-medium transition-all duration-300 shadow-sm
              {!activeCategory 
                ? 'bg-cream-600 text-coffee-900 shadow-md ring-2 ring-cream-300' 
                : 'bg-white text-coffee-800 hover:bg-coffee-50 hover:-translate-y-0.5 hover:shadow'}"
          on:click={scrollToTop}
        >
          All Items
        </button>
        
        <!-- Category buttons -->
        {#each categories as category}
          <button 
            class="px-5 py-2.5 rounded-xl text-sm whitespace-nowrap font-medium transition-all duration-300 shadow-sm
                  {activeCategory === category.id 
                    ? 'bg-cream-600 text-coffee-900 shadow-md ring-2 ring-cream-300' 
                    : 'bg-white text-coffee-800 hover:bg-coffee-50 hover:-translate-y-0.5 hover:shadow'}"
            on:click={() => selectCategory(category.id)}
          >
            {category.name}
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Gradient fade on right side -->
    <div class="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-coffee-50 to-transparent z-10 pointer-events-none"></div>
  </div>
{:else}
  <!-- Desktop sidebar categories with improved styling -->
  <div class="bg-white rounded-2xl shadow-soft p-5 border border-coffee-100 sticky top-24">
    <h3 class="heading-serif font-semibold text-xl text-coffee-800 mb-4">Menu Categories</h3>
    
    <!-- Decorative coffee bean icon at top -->
    <div class="absolute top-4 right-4 text-coffee-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
        <path d="M18 8h1a4 4 0 010 8h-1"></path>
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path>
        <line x1="6" y1="1" x2="6" y2="4"></line>
        <line x1="10" y1="1" x2="10" y2="4"></line>
        <line x1="14" y1="1" x2="14" y2="4"></line>
      </svg>
    </div>
    
    <!-- Category list -->
    <ul class="space-y-2">
      <!-- "All Categories" button -->
      <li>
        <button 
          class="group w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300
                {!activeCategory 
                  ? 'bg-cream-600 text-coffee-900 font-medium shadow-sm' 
                  : 'text-coffee-800 hover:bg-coffee-50 hover:pl-5'}"
          on:click={scrollToTop}
        >
          <div class="flex items-center">
            <!-- Icon for All Categories -->
            <span class="mr-3 {!activeCategory ? 'text-coffee-800' : 'text-coffee-400 group-hover:text-coffee-600'}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </span>
            All Categories
          </div>
        </button>
      </li>
      
      <!-- Individual category buttons -->
      {#each categories as category}
        <li>
          <button 
            class="group w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300
                  {activeCategory === category.id 
                    ? 'bg-cream-600 text-coffee-900 font-medium shadow-sm' 
                    : 'text-coffee-800 hover:bg-coffee-50 hover:pl-5'}"
            on:click={() => selectCategory(category.id)}
          >
            <div class="flex items-center">
              <!-- Category-specific icons could be added here -->
              <span class="mr-3 {activeCategory === category.id ? 'text-coffee-800' : 'text-coffee-400 group-hover:text-coffee-600'}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
              {category.name}
            </div>
          </button>
        </li>
      {/each}
    </ul>
    
    <!-- Decorative element at bottom -->
    <div class="mt-6 h-px bg-gradient-to-r from-transparent via-coffee-200 to-transparent"></div>
    <p class="mt-4 text-xs text-coffee-500 text-center">Choose a category to filter the menu</p>
  </div>
{/if}

<style>
  /* Hide scrollbar for cleaner UI but keep functionality */
  .hide-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
</style>
