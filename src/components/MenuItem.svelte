<script>
  export let item;
  
  // Generate icon based on item type
  function getIconForItem(itemId) {
    // Map of item types to suitable Feather icons
    const iconMap = {
      'espresso': 'coffee',
      'americano': 'coffee',
      'cappuccino': 'coffee',
      'latte': 'coffee',
      'mocha': 'coffee',
      'hot-chocolate': 'coffee',
      'iced-coffee': 'thermometer',
      'cold-brew': 'droplet',
      'iced-latte': 'thermometer',
      'iced-mocha': 'thermometer',
      'frappe': 'thermometer',
      'caramel-macchiato': 'coffee',
      'vanilla-latte': 'coffee',
      'chai-latte': 'coffee',
      'matcha-latte': 'coffee',
      'croissant': 'triangle',
      'chocolate-croissant': 'triangle',
      'muffin': 'circle',
      'cinnamon-roll': 'circle',
      'avocado-toast': 'square',
      'egg-sandwich': 'square',
      'turkey-sandwich': 'square'
    };
    
    return iconMap[itemId] || 'circle';
  }
  
  const icon = getIconForItem(item.id);
</script>

<div class="menu-item group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-coffee-100">
  <div class="p-5">
    <!-- Item header with icon -->
    <div class="flex justify-between items-start">
      <!-- Title and description -->
      <div class="flex-1 pr-3">
        <h3 class="font-semibold text-lg sm:text-xl text-coffee-800 heading-serif group-hover:text-coffee-600 transition-colors">{item.name}</h3>
        <p class="text-coffee-600 text-sm mt-1 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">{item.description}</p>
      </div>
      
      <!-- Coffee icon with fancy hover animation -->
      <div class="ml-2 flex-shrink-0 bg-coffee-100 p-3 rounded-full transform group-hover:rotate-12 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-coffee-600 group-hover:text-coffee-700">
          {#if icon === 'coffee'}
            <path d="M18 8h1a4 4 0 010 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          {:else if icon === 'thermometer'}
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
          {:else if icon === 'droplet'}
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          {:else if icon === 'triangle'}
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          {:else if icon === 'square'}
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          {:else}
            <circle cx="12" cy="12" r="10"></circle>
          {/if}
        </svg>
      </div>
    </div>
    
    <!-- Divider with gradient -->
    <div class="my-4 h-px bg-gradient-to-r from-transparent via-coffee-200 to-transparent"></div>
    
    <!-- Price and action button -->
    <div class="flex justify-between items-center">
      <div class="flex flex-col">
        <span class="text-coffee-800 font-bold text-lg">${item.price.toFixed(2)}</span>
        <span class="text-coffee-500 text-xs">Tax included</span>
      </div>
      
      <button class="px-4 py-2 bg-cream-600 text-coffee-900 font-medium rounded-lg hover:bg-cream-500 transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add</span>
      </button>
    </div>
  </div>
</div>
