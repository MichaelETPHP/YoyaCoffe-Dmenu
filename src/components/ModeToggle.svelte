<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let mode = 'menu'; // 'menu' or 'payment'
  
  function toggleMode() {
    mode = mode === 'menu' ? 'payment' : 'menu';
    dispatch('modeChange', { mode });
  }
  
  // Emoji animations
  let isAnimating = false;
  
  function animateEmoji() {
    isAnimating = true;
    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }
  
  function handleToggle() {
    animateEmoji();
    toggleMode();
  }
</script>

<div class="fixed bottom-4 left-4 z-50">
  <button 
    on:click={handleToggle}
    class="bg-white rounded-full shadow-lg p-3 flex items-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    aria-label={mode === 'menu' ? 'Switch to payment mode' : 'Switch to menu mode'}
  >
    <div class="flex items-center">
      <div class="w-10 h-10 flex items-center justify-center">
        {#if mode === 'menu'}
          <span class="text-2xl transform {isAnimating ? 'scale-125' : ''} transition-transform duration-300">🤤</span>
        {:else}
          <span class="text-2xl transform {isAnimating ? 'scale-125' : ''} transition-transform duration-300">💰</span>
        {/if}
      </div>
      
      <div class="ml-2 text-coffee-800 font-medium">
        {mode === 'menu' ? 'Menu Mode' : 'Payment Mode'}
      </div>
    </div>
  </button>
</div>