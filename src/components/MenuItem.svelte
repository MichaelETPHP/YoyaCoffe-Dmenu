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

<div class="menu-item bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
  <div class="p-4">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="font-semibold text-lg text-gray-800">{item.name}</h3>
        <p class="text-gray-600 text-sm mt-1">{item.description}</p>
      </div>
      <div class="ml-4 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600">
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
    <div class="mt-4 flex justify-between items-center">
      <span class="text-amber-700 font-bold">${item.price.toFixed(2)}</span>
      <button class="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm">
        Add
      </button>
    </div>
  </div>
</div>
