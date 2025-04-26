<script>
  import MenuItem from './MenuItem.svelte';
  import { slide } from 'svelte/transition';
  
  export let category;
  let isExpanded = true;
  
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
</script>

<section id={category.id} class="menu-category mb-10">
  <!-- Category header with toggle functionality -->
  <div 
    class="group flex items-center justify-between cursor-pointer mb-6"
    on:click={toggleExpanded}
    aria-expanded={isExpanded}
    aria-controls="category-items-{category.id}"
  >
    <div class="flex items-center">
      <!-- Decorative coffee bean icon -->
      <div class="hidden sm:flex mr-3 text-coffee-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 transform transition-transform duration-500 group-hover:rotate-45">
          <path d="M6 11l3.05-1.75c.47-.27 1.15-.21 1.5.13l5.03 5.03c.49.49.51 1.3.04 1.8l-3.75 3.75c-.48.48-1.28.48-1.76 0l-4.02-4.02C5.57 15.42 5.57 14.57 6 14l0 0z"></path>
          <path d="M10 6l1.95-1.95c.49-.49 1.28-.49 1.77 0l4.02 4.02c.49.49.49 1.28 0 1.77l-2 2"></path>
        </svg>
      </div>
      
      <!-- Category name using serif font -->
      <h2 class="heading-serif text-2xl sm:text-3xl font-bold text-coffee-800 group-hover:text-coffee-600 transition-colors">
        {category.name}
      </h2>
    </div>
    
    <!-- Toggle indicator with animation -->
    <div class="flex items-center text-coffee-500 group-hover:text-coffee-700 transition-colors">
      <span class="mr-2 text-sm font-medium">{isExpanded ? 'Hide' : 'Show'}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 transform transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  </div>
  
  <!-- Decorative divider with gradient -->
  <div class="h-px bg-gradient-to-r from-coffee-200 via-coffee-300 to-coffee-200 mb-6 opacity-70"></div>
  
  <!-- Grid of menu items with expand/collapse animation -->
  {#if isExpanded}
    <div 
      id="category-items-{category.id}" 
      class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 animate-fadeIn"
      transition:slide={{ duration: 300 }}
    >
      {#each category.items as item}
        <MenuItem {item} />
      {/each}
    </div>
  {/if}
</section>

<style>
  /* Basic animation for item appearance */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
</style>
