<script>
  let isMenuOpen = false;
  
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<header class="bg-coffee-800 text-white shadow-soft sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <!-- Logo with subtle animation on hover -->
      <div class="transform transition-transform duration-300 hover:scale-105">
        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-cream-300">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 1v3M10 1v3M14 1v3" />
        </svg>
      </div>
      
      <!-- Brand identity with serif font for elegance -->
      <div>
        <h1 class="heading-serif text-xl md:text-2xl lg:text-3xl font-bold tracking-wide">Yoya Coffee</h1>
        <p class="text-xs md:text-sm text-cream-200 font-light tracking-wider">SPECIALTY COFFEE & PASTRIES</p>
      </div>
    </div>
    
    <!-- Desktop navigation with modern micro-interactions -->
    <nav class="hidden md:flex items-center space-x-8">
      <a href="/#about" class="text-cream-100 hover:text-cream-300 transition-all duration-300 hover:underline decoration-2 underline-offset-4 py-1 text-base font-medium">About</a>
      <a href="/#locations" class="text-cream-100 hover:text-cream-300 transition-all duration-300 hover:underline decoration-2 underline-offset-4 py-1 text-base font-medium">Locations</a>
      <a href="/#contact" class="text-cream-100 hover:text-cream-300 transition-all duration-300 hover:underline decoration-2 underline-offset-4 py-1 text-base font-medium">Contact</a>
      <a href="/#order" class="bg-cream-600 hover:bg-cream-500 text-coffee-900 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5">Order Online</a>
    </nav>
    
    <!-- Mobile menu button with animation -->
    <button 
      class="md:hidden text-white focus:outline-none p-2 rounded-lg hover:bg-coffee-700 transition-colors"
      aria-label="Toggle menu"
      on:click={toggleMenu}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  </div>
  
  <!-- Mobile menu dropdown with animation -->
  {#if isMenuOpen}
    <div class="md:hidden bg-coffee-700 transition-all duration-300 ease-in-out">
      <div class="px-4 pt-2 pb-4 space-y-3">
        <a href="/#about" class="block text-cream-100 hover:text-cream-300 py-2 text-base font-medium">About</a>
        <a href="/#locations" class="block text-cream-100 hover:text-cream-300 py-2 text-base font-medium">Locations</a>
        <a href="/#contact" class="block text-cream-100 hover:text-cream-300 py-2 text-base font-medium">Contact</a>
        <a href="/#order" class="block bg-cream-600 hover:bg-cream-500 text-coffee-900 px-4 py-2 my-2 rounded-lg font-medium text-center">Order Online</a>
      </div>
    </div>
  {/if}
</header>
