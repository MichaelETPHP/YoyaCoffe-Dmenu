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
  <!-- Mobile horizontal scrolling categories -->
  <div class="overflow-x-auto pb-2">
    <div class="flex space-x-2 min-w-max">
      <button 
        class="px-4 py-2 rounded-full text-sm whitespace-nowrap
              {!activeCategory ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}"
        on:click={scrollToTop}
      >
        All
      </button>
      
      {#each categories as category}
        <button 
          class="px-4 py-2 rounded-full text-sm whitespace-nowrap
                {activeCategory === category.id ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}"
          on:click={() => selectCategory(category.id)}
        >
          {category.name}
        </button>
      {/each}
    </div>
  </div>
{:else}
  <!-- Desktop sidebar categories -->
  <div class="bg-white rounded-lg shadow-md p-4">
    <h3 class="font-semibold text-lg text-gray-800 mb-3">Menu Categories</h3>
    
    <ul class="space-y-1">
      <li>
        <button 
          class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                {!activeCategory ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-100'}"
          on:click={scrollToTop}
        >
          All Categories
        </button>
      </li>
      
      {#each categories as category}
        <li>
          <button 
            class="w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  {activeCategory === category.id ? 'bg-amber-600 text-white' : 'text-gray-700 hover:bg-gray-100'}"
            on:click={() => selectCategory(category.id)}
          >
            {category.name}
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}
