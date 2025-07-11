<script>
  import { onMount } from 'svelte';
  
  export let item;
  
  // State for feedback and UI
  let likeInProgress = false;
  let dislikeInProgress = false;
  let feedbackMessage = "";
  let showFeedback = false;
  let errorMessage = null;
  
  // Determine icon based on item properties or ID
  function determineItemIcon(item) {
    // First try to use categoryName if available
    if (item.categoryName) {
      const category = item.categoryName.toLowerCase();
      if (category.includes('hot')) return 'coffee';
      if (category.includes('cold') || category.includes('iced')) return 'thermometer';
      if (category.includes('espresso')) return 'coffee';
      if (category.includes('pastry') || category.includes('bakery')) return 'triangle';
      if (category.includes('sandwich')) return 'square';
    }
    
    // Fallback to ID-based mapping
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
    
    // Try to match based on name if id-based mapping fails
    if (!iconMap[item.id]) {
      const name = item.name.toLowerCase();
      if (name.includes('coffee') || name.includes('latte') || name.includes('espresso')) return 'coffee';
      if (name.includes('cold') || name.includes('iced')) return 'thermometer';
      if (name.includes('croissant') || name.includes('pastry')) return 'triangle';
      if (name.includes('sandwich') || name.includes('toast')) return 'square';
      if (name.includes('muffin') || name.includes('cookie')) return 'circle';
    }
    
    return iconMap[item.id] || 'circle';
  }
  
  const icon = determineItemIcon(item);
  
  // Function to like an item via API
  async function handleLike() {
    if (likeInProgress) return; // Prevent multiple clicks
    likeInProgress = true;
    
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/menu/${item.id}/like?_=${timestamp}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to like item: ${response.statusText}`);
      }
      
      // Check for JSON content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server returned invalid data format. Please try again later.');
      }
      
      const updatedItem = await response.json();
      
      // Update the item with the new like count
      item.likes = updatedItem.likes;
      
      // Show feedback message
      feedbackMessage = "Thank you for loving our " + item.name + "! 💕";
      showFeedback = true;
      setTimeout(() => { showFeedback = false; }, 3000);
      
      // Clear any error
      errorMessage = null;
      
    } catch (error) {
      console.error('Error liking item:', error);
      errorMessage = "Couldn't save your like. Please try again.";
      setTimeout(() => { errorMessage = null; }, 3000);
    } finally {
      likeInProgress = false;
    }
  }
  
  // Function to dislike an item via API
  async function handleDislike() {
    if (dislikeInProgress) return; // Prevent multiple clicks
    dislikeInProgress = true;
    
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/menu/${item.id}/dislike?_=${timestamp}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to dislike item: ${response.statusText}`);
      }
      
      // Check for JSON content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        throw new Error('Server returned invalid data format. Please try again later.');
      }
      
      const updatedItem = await response.json();
      
      // Update the item with the new dislike count
      item.dislikes = updatedItem.dislikes;
      
      // Show feedback message
      feedbackMessage = "We'll work to improve our " + item.name + "! 🙏";
      showFeedback = true;
      setTimeout(() => { showFeedback = false; }, 3000);
      
      // Clear any error
      errorMessage = null;
      
    } catch (error) {
      console.error('Error disliking item:', error);
      errorMessage = "Couldn't save your feedback. Please try again.";
      setTimeout(() => { errorMessage = null; }, 3000);
    } finally {
      dislikeInProgress = false;
    }
  }
</script>

<div class="menu-item group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-coffee-100 animate-fade-in relative">
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

  <!-- Feedback message -->
  {#if showFeedback}
    <div class="absolute top-2 left-0 right-0 mx-auto text-center z-20 animate-fade-in-out">
      <div class="bg-coffee-800 text-white px-3 py-2 rounded-full inline-block shadow-lg text-sm">
        {feedbackMessage}
      </div>
    </div>
  {/if}
  
  <!-- Error message -->
  {#if errorMessage}
    <div class="absolute top-2 left-0 right-0 mx-auto text-center z-20 animate-fade-in-out">
      <div class="bg-red-600 text-white px-3 py-2 rounded-full inline-block shadow-lg text-sm">
        {errorMessage}
      </div>
    </div>
  {/if}

  <!-- Coffee Image -->
  <div class="w-full h-48 overflow-hidden">
    <img src={item.image} alt={item.name} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
  </div>

  <div class="p-5">
    <!-- Item header -->
    <div class="flex justify-between items-start">
      <!-- Title and description -->
      <div class="flex-1 pr-3">
        <h3 class="font-semibold text-lg sm:text-xl text-coffee-800 heading-serif group-hover:text-coffee-600 transition-colors">{item.name}</h3>
        <p class="text-coffee-600 text-sm mt-1 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">{item.description}</p>
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
    
    <!-- Price and like/dislike system -->
    <div class="flex justify-between items-center">
      <div class="flex flex-col">
        <span class="text-coffee-800 font-bold text-lg group-hover:text-coffee-900 transition-colors duration-300 transform group-hover:scale-105">{item.price} ETB</span>
      </div>
      
      <!-- Like/Dislike Buttons -->
      <div class="flex space-x-2">
        <!-- Like Button with count -->
        <button 
          on:click={handleLike}
          class="group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 {likeInProgress ? 'opacity-70 cursor-wait' : 'hover:bg-red-50'} bg-gray-100"
          aria-label="Like this item"
          disabled={likeInProgress || dislikeInProgress}
        >
          <span class="text-lg group-hover:scale-110 transition-transform duration-200">❤️</span>
          {#if item.likes && item.likes > 0}
            <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {item.likes}
            </span>
          {/if}
        </button>
        
        <!-- Dislike Button with count -->
        <button 
          on:click={handleDislike}
          class="group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 {dislikeInProgress ? 'opacity-70 cursor-wait' : 'hover:bg-gray-200'} bg-gray-100"
          aria-label="Dislike this item"
          disabled={likeInProgress || dislikeInProgress}
        >
          <span class="text-lg group-hover:scale-110 transition-transform duration-200">👎</span>
          {#if item.dislikes && item.dislikes > 0}
            <span class="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {item.dislikes}
            </span>
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }
  
  .animate-fade-in-out {
    animation: fadeInOut 3s ease-out forwards;
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
  
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    10% {
      opacity: 1;
      transform: translateY(0);
    }
    80% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-10px);
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
