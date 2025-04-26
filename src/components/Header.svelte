<script>
  // We could add logic here for mobile menu toggling if needed
</script>

<header class="bg-amber-800 text-white shadow-md">
  <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <div class="flex items-center">
      <div class="mr-3">
        <!-- SVG Logo inline -->
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="text-amber-200">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 1v3M10 1v3M14 1v3" />
        </svg>
      </div>
      <div>
        <h1 class="text-xl md:text-2xl font-bold">Yoya Coffee</h1>
        <p class="text-xs md:text-sm text-amber-200">Specialty Coffee & Pastries</p>
      </div>
    </div>
    
    <div class="hidden md:flex space-x-6">
      <a href="/#about" class="hover:text-amber-200 transition-colors">About</a>
      <a href="/#locations" class="hover:text-amber-200 transition-colors">Locations</a>
      <a href="/#contact" class="hover:text-amber-200 transition-colors">Contact</a>
    </div>
    
    <!-- Mobile menu button -->
    <button class="md:hidden text-white focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  </div>
</header>
