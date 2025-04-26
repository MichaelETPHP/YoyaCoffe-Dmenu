<script>
  export let searchQuery = '';
  let isFocused = false;
  
  function handleInput(event) {
    searchQuery = event.target.value;
  }
  
  function clearSearch() {
    searchQuery = '';
  }
  
  function handleFocus() {
    isFocused = true;
  }
  
  function handleBlur() {
    isFocused = false;
  }
</script>

<div class="w-full mb-8">
  <div class="relative max-w-2xl mx-auto">
    <!-- Search label for accessibility -->
    <label for="menu-search" class="block text-coffee-700 font-medium mb-2 text-sm">Find your favorite item</label>
    
    <!-- Search wrapper with animated focus state -->
    <div class="relative transition-all duration-300 {isFocused ? 'scale-[1.02]' : ''}">
      <!-- Search icon -->
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-coffee-400 {isFocused ? 'text-coffee-600' : ''}">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      
      <!-- Search input -->
      <input
        id="menu-search"
        type="text"
        bind:value={searchQuery}
        on:input={handleInput}
        on:focus={handleFocus}
        on:blur={handleBlur}
        placeholder="Search for coffee, pastries, sandwiches..."
        class="block w-full bg-white border-2 border-coffee-200 rounded-xl py-3 pl-12 pr-12 placeholder-coffee-400
               focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-cream-400 focus:shadow-soft
               text-coffee-800 font-medium transition-all duration-300"
      />
      
      <!-- Clear button (visible when input has text) -->
      {#if searchQuery}
        <button 
          on:click={clearSearch}
          class="absolute inset-y-0 right-0 pr-4 flex items-center text-coffee-400 hover:text-coffee-700 transition-colors"
          aria-label="Clear search"
        >
          <div class="p-1 rounded-full hover:bg-coffee-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </button>
      {/if}
    </div>
    
    <!-- Helpful search message -->
    <p class="mt-2 text-xs text-coffee-500 text-center">Type the name of an item or ingredient to find it quickly</p>
  </div>
</div>
