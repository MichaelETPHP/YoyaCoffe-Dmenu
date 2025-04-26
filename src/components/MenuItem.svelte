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

<div class="menu-item group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-coffee-100 animate-fade-in">
  <!-- Steam animation for hot drinks -->
  {#if icon === 'coffee'}
    <div class="absolute top-0 right-3 z-10">
      <div class="steam-container">
        <div class="steam steam-one"></div>
        <div class="steam steam-two"></div>
        <div class="steam steam-three"></div>
        <div class="steam steam-four"></div>
      </div>
    </div>
  {/if}

  <!-- Coffee Image -->
  <div class="w-full h-48 overflow-hidden">
    <img src={item.image} alt={item.name} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
  </div>

  <div class="p-5">
    <!-- Item header with rating -->
    <div class="flex justify-between items-start">
      <!-- Title and description -->
      <div class="flex-1 pr-3">
        <h3 class="font-semibold text-lg sm:text-xl text-coffee-800 heading-serif group-hover:text-coffee-600 transition-colors">{item.name}</h3>
        <p class="text-coffee-600 text-sm mt-1 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">{item.description}</p>
      </div>
      
      <!-- Rating display -->
      <div class="flex items-center bg-amber-50 px-2 py-1 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="ml-1 text-sm font-medium text-coffee-800">{item.rating}</span>
      </div>
    </div>
    
    <!-- Coffee icon indicator with animation -->
    <div class="mt-2 inline-flex items-center px-2 py-1 bg-coffee-100 rounded-full group-hover:bg-coffee-200 transition-colors duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-coffee-600 mr-1 group-hover:text-coffee-800 transition-colors duration-300 group-hover:rotate-12 transform">
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
      <span class="text-xs text-coffee-700 group-hover:text-coffee-900 transition-colors duration-300">{icon.charAt(0).toUpperCase() + icon.slice(1)}</span>
    </div>
    
    <!-- Divider with gradient and animation -->
    <div class="my-4 h-px bg-gradient-to-r from-transparent via-coffee-200 to-transparent group-hover:via-coffee-300 transition-colors duration-500"></div>
    
    <!-- Price only (no add button) -->
    <div class="flex justify-between items-center">
      <div class="flex flex-col">
        <span class="text-coffee-800 font-bold text-lg group-hover:text-coffee-900 transition-colors duration-300 transform group-hover:scale-105">{item.price} ETB</span>
      </div>
      <!-- Rating display at the bottom -->
      <div class="flex items-center bg-amber-50 px-3 py-1 rounded-full group-hover:bg-amber-100 transition-colors duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-500 group-hover:text-yellow-600 transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="ml-1 text-sm font-medium text-coffee-800 group-hover:text-coffee-900 transition-colors duration-300">{item.rating}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
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
  
  /* Steam animation */
  .steam-container {
    position: relative;
    width: 40px;
    height: 40px;
  }
  
  .steam {
    position: absolute;
    height: 10px;
    width: 4px;
    border-radius: 10px;
    background-color: white;
    opacity: 0;
    animation: steam 3s ease-out infinite;
  }
  
  .steam-one {
    left: 10px;
    animation-delay: 0.5s;
  }
  
  .steam-two {
    left: 20px;
    animation-delay: 1s;
  }
  
  .steam-three {
    left: 15px;
    animation-delay: 1.5s;
  }
  
  .steam-four {
    left: 25px;
    animation-delay: 2s;
  }
  
  @keyframes steam {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    50% {
      transform: translateY(-10px) scale(1.5);
      opacity: 0.5;
    }
    95% {
      opacity: 0;
    }
    100% {
      transform: translateY(-20px) scale(2);
      opacity: 0;
    }
  }
</style>
