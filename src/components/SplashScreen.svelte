<script>
  import { onMount } from 'svelte';
  
  export let duration = 2500; // Duration in milliseconds (2.5 seconds by default)
  let visible = true;
  let fadeOut = false;
  
  // When component mounts, set a timeout to hide the splash screen
  onMount(() => {
    // Start fade out animation after specified duration
    setTimeout(() => {
      fadeOut = true;
    }, duration - 500); // Start fade-out animation 500ms before hiding
    
    // Hide splash screen completely after the full duration
    setTimeout(() => {
      visible = false;
    }, duration);
  });
</script>

{#if visible}
  <div 
    class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-coffee-800 text-white transition-opacity duration-500 ease-in-out {fadeOut ? 'opacity-0' : 'opacity-100'}"
  >
    <div class="w-full max-w-xs transform transition-all animate-fade-in-up">
      <!-- Coffee cup with steam animation -->
      <div class="flex flex-col items-center">
        <div class="relative w-24 h-24 mb-3">
          <!-- Coffee cup -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
            class="w-full h-full text-cream-300 animate-bounce-slow">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M6 1v3M10 1v3M14 1v3" />
          </svg>
          
          <!-- Steam animations -->
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 flex space-x-1">
            <div class="w-1 h-3 bg-cream-200 rounded-full opacity-0 animate-steam-1"></div>
            <div class="w-1 h-4 bg-cream-200 rounded-full opacity-0 animate-steam-2"></div>
            <div class="w-1 h-2 bg-cream-200 rounded-full opacity-0 animate-steam-3"></div>
          </div>
        </div>
        
        <!-- Brand name with animated reveal -->
        <div class="text-center">
          <h1 class="font-serif text-3xl md:text-4xl font-bold mb-1 animate-reveal">
            Yoya Coffee
          </h1>
          <p class="text-xs text-cream-300 tracking-wider font-light animate-reveal-delay">
            SPECIALTY COFFEE & PASTRIES
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .animate-bounce-slow {
    animation: bounce 3s infinite;
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  .animate-reveal {
    opacity: 0;
    transform: translateY(10px);
    animation: reveal 0.6s ease-out 0.3s forwards;
  }
  
  .animate-reveal-delay {
    opacity: 0;
    transform: translateY(10px);
    animation: reveal 0.6s ease-out 0.6s forwards;
  }
  
  .animate-steam-1 {
    animation: steam 2s ease-out 0.2s infinite;
  }
  
  .animate-steam-2 {
    animation: steam 2s ease-out 0.6s infinite;
  }
  
  .animate-steam-3 {
    animation: steam 2s ease-out 1s infinite;
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes steam {
    0% {
      transform: translateY(0) scaleX(1);
      opacity: 0;
    }
    15% {
      opacity: 0.8;
    }
    50% {
      transform: translateY(-10px) scaleX(1.5);
      opacity: 0.2;
    }
    95% {
      opacity: 0;
    }
    100% {
      transform: translateY(-20px) scaleX(2);
      opacity: 0;
    }
  }
</style>