<script>
  import { onMount } from 'svelte';
  import { getAllItems } from '../data/menu.js';
  
  // Get all menu items and select the 5 most popular for the slider
  const allItems = getAllItems();
  const featuredItems = allItems
    .sort(() => 0.5 - Math.random()) // Randomly order items (in a real app, you'd sort by popularity)
    .slice(0, 5); // Get the first 5
  
  let currentIndex = 0;
  let sliderInterval;
  let slideWidth;
  let sliderContainer;
  
  onMount(() => {
    // Start the automatic slide rotation
    startSlider();
    
    // Cleanup when component unmounts
    return () => {
      clearInterval(sliderInterval);
    };
  });
  
  function startSlider() {
    sliderInterval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds
  }
  
  function resetInterval() {
    clearInterval(sliderInterval);
    startSlider();
  }
  
  function gotoSlide(index) {
    currentIndex = index;
    resetInterval();
  }
  
  function nextSlide() {
    currentIndex = (currentIndex + 1) % featuredItems.length;
  }
  
  function prevSlide() {
    currentIndex = (currentIndex - 1 + featuredItems.length) % featuredItems.length;
  }
</script>

<div class="relative overflow-hidden bg-coffee-900 text-cream-100">
  <!-- Special banner for Yoya Coffee Academy -->
  <div class="absolute top-0 right-0 z-20 bg-cream-600 text-coffee-900 font-bold py-1 px-4 rounded-bl-lg transform rotate-0 shadow-lg">
    <span class="text-xs md:text-sm">YOYA COFFEE ACADEMY</span>
  </div>
  
  <!-- Featured Slider -->
  <div 
    class="slider-container relative w-full h-[70vh] overflow-hidden"
    bind:this={sliderContainer}
  >
    <!-- Slides -->
    <div class="slides-wrapper relative flex h-full" style="transform: translateX(-{currentIndex * 100}%)">
      {#each featuredItems as item, index}
        <div class="slide-item relative w-full h-full flex-shrink-0 transition-transform duration-500">
          <!-- Image with dark overlay -->
          <div class="absolute inset-0 w-full h-full">
            <img src={item.image} alt={item.name} class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-coffee-900 via-coffee-900/70 to-transparent"></div>
          </div>
          
          <!-- Content -->
          <div class="absolute bottom-0 left-0 w-full p-8 md:p-12 z-10 mb-12">
            <div class="animate-slide-up" class:active={index === currentIndex}>
              <h2 class="text-2xl md:text-4xl font-serif font-bold text-cream-100 mb-2">{item.name}</h2>
              <p class="max-w-2xl text-base md:text-lg text-cream-200 mb-4">{item.description}</p>
              <div class="flex items-center gap-4">
                <span class="bg-cream-600 text-coffee-900 px-3 py-1 rounded-full font-bold">{item.price} ETB</span>
                <a href="#menu" class="inline-flex items-center bg-coffee-700 hover:bg-coffee-600 text-cream-100 px-4 py-2 rounded-full transition-colors duration-300">
                  <span>View on Menu</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L12.586 11H5a1 1 0 1 1 0-2h7.586l-2.293-2.293a1 1 0 0 1 0-1.414z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Yoya Coffee Academy Section -->
    <div class="absolute bottom-0 left-0 right-0 bg-coffee-800 p-4 md:p-6 z-10">
      <div class="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <div class="mb-3 md:mb-0">
          <h3 class="text-lg md:text-xl font-bold text-cream-100">Yoya Coffee Academy</h3>
          <p class="text-xs md:text-sm text-cream-300">Learn the art of coffee from our expert baristas</p>
        </div>
        <a href="#" class="bg-cream-600 hover:bg-cream-500 text-coffee-900 px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center">
          <span>Join Our Classes</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L12.586 11H5a1 1 0 1 1 0-2h7.586l-2.293-2.293a1 1 0 0 1 0-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
    
    <!-- Navigation Arrows -->
    <button 
      class="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-coffee-900/50 text-cream-100 hover:bg-coffee-700 flex items-center justify-center z-10 transition-colors duration-300"
      on:click={() => { prevSlide(); resetInterval(); }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
    <button 
      class="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-coffee-900/50 text-cream-100 hover:bg-coffee-700 flex items-center justify-center z-10 transition-colors duration-300"
      on:click={() => { nextSlide(); resetInterval(); }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <!-- Pagination Dots -->
    <div class="absolute bottom-24 left-0 right-0 flex justify-center gap-2 z-10">
      {#each featuredItems as _, index}
        <button 
          class="h-2 w-2 rounded-full transition-all duration-300 {index === currentIndex ? 'bg-cream-100 w-8' : 'bg-cream-100/50 hover:bg-cream-100/70'}"
          on:click={() => gotoSlide(index)}
          aria-label="Go to slide {index + 1}"
        ></button>
      {/each}
    </div>
  </div>
</div>

<style>
  .slides-wrapper {
    transition: transform 0.5s ease-in-out;
  }
  
  .animate-slide-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  
  .animate-slide-up.active {
    opacity: 1;
    transform: translateY(0);
  }
</style>