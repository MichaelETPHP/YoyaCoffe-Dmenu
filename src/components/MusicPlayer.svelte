<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Classical coffee shop music playlist - using free-to-use audio tracks
  const MUSIC_OPTIONS = [
    { id: 'ytpl2_D_s8-Yg', title: 'Coffee Shop Ambience' },
    { id: '1fueZCTYkpA', title: 'Classical Piano' },
    { id: 'JEsF1YSibHM', title: 'Jazz Coffee' }
  ];
  
  let playerReady = false;
  let playing = false;
  let currentTrack = 0;
  let volume = 20; // Default low volume
  let player;
  let isCollapsed = true; // Start collapsed on mobile
  let isMobile = false;
  
  // Toggle collapsed state
  function toggleCollapsed() {
    isCollapsed = !isCollapsed;
  }
  
  // Check if on mobile device
  function checkMobile() {
    isMobile = window.innerWidth < 768;
    // On mobile, start collapsed unless playing
    if (isMobile && !playing) {
      isCollapsed = true;
    }
  }
  
  onMount(() => {
    // Check for mobile screen
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check if music was playing in previous session
    const savedState = localStorage.getItem('yoyaCoffeeMusic');
    if (savedState) {
      const state = JSON.parse(savedState);
      volume = state.volume || 20;
      currentTrack = state.track || 0;
      playing = state.playing || false;
      
      // If was playing previously, we'll uncollapse
      if (playing) {
        isCollapsed = false;
      }
    }
    
    // Load YouTube API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: MUSIC_OPTIONS[currentTrack].id,
        playerVars: {
          autoplay: 0, // No autoplay by default
          controls: 0,
          showinfo: 0,
          rel: 0,
          fs: 0,
          modestbranding: 1,
          loop: 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
    };
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });
  
  function onPlayerReady(event) {
    playerReady = true;
    // Set volume to the saved or default level
    player.setVolume(volume);
  }
  
  function onPlayerStateChange(event) {
    // Update playing state based on player state
    playing = event.data === YT.PlayerState.PLAYING;
    
    // Save state to localStorage when status changes
    savePlayerState();
    
    // If video ended, play next track
    if (event.data === YT.PlayerState.ENDED) {
      playNextTrack();
    }
  }
  
  function onPlayerError(event) {
    console.error('YouTube player error:', event.data);
    // Try playing the next track if there's an error
    playNextTrack();
  }
  
  function togglePlay() {
    if (!playerReady) return;
    
    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
      // When play is pressed, ensure player is expanded
      isCollapsed = false;
    }
  }
  
  function changeVolume(newVolume) {
    if (!playerReady) return;
    
    volume = newVolume;
    player.setVolume(volume);
    savePlayerState();
  }
  
  function playNextTrack() {
    if (!playerReady) return;
    
    currentTrack = (currentTrack + 1) % MUSIC_OPTIONS.length;
    player.loadVideoById(MUSIC_OPTIONS[currentTrack].id);
    savePlayerState();
  }
  
  function playPrevTrack() {
    if (!playerReady) return;
    
    currentTrack = (currentTrack - 1 + MUSIC_OPTIONS.length) % MUSIC_OPTIONS.length;
    player.loadVideoById(MUSIC_OPTIONS[currentTrack].id);
    savePlayerState();
  }
  
  function savePlayerState() {
    localStorage.setItem('yoyaCoffeeMusic', JSON.stringify({
      playing,
      volume,
      track: currentTrack
    }));
  }
  
  // This function is no longer needed, replaced by toggleCollapsed
  
  onDestroy(() => {
    // Clean up player when component is destroyed
    if (player && playerReady) {
      // Save the current state before stopping
      savePlayerState();
      player.stopVideo();
    }
  });
</script>

<div class="fixed bottom-4 right-4 z-50 transition-all duration-300">
  <!-- Collapsed state: Just show the play/pause button on mobile -->
  {#if isCollapsed && isMobile}
    <div 
      class="bg-white bg-opacity-95 rounded-full shadow-lg p-2 transition-all duration-300 animate-fadeIn"
    >
      <button 
        on:click={() => { isCollapsed = false; if (!playing) togglePlay(); }}
        class="w-12 h-12 flex items-center justify-center rounded-full bg-coffee-100 hover:bg-coffee-300 transition-colors"
        aria-label="Expand music player"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-coffee-800" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  {:else}
    <!-- Expanded music player -->
    <div 
      class="bg-white bg-opacity-95 rounded-xl shadow-lg p-3 flex flex-col overflow-hidden relative transition-all duration-300 animate-fadeIn"
    >
      <!-- Top section with header and collapse button on mobile -->
      <div class="flex items-center justify-between mb-2">
        {#if isMobile}
          <!-- Collapse button on mobile -->
          <button
            on:click={() => isCollapsed = true}
            class="w-6 h-6 flex items-center justify-center text-coffee-600 hover:text-coffee-800 transition-colors"
            aria-label="Collapse music player"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {:else}
          <!-- Coffee cup icon on desktop -->
          <div class="w-6 h-6 text-coffee-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M6 1v3M10 1v3M14 1v3" />
            </svg>
          </div>
        {/if}
        
        <!-- Track title -->
        <div class="flex-1 px-2 text-center">
          <div class="text-sm font-medium text-coffee-800 truncate">
            {playing ? MUSIC_OPTIONS[currentTrack].title : 'Yoya Music'}
          </div>
        </div>
        
        <!-- Volume indicator -->
        <div class="flex items-center">
          <div class="w-5 h-5 text-coffee-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Volume slider -->
      <div class="w-full mb-3">
        <input
          type="range"
          min="0"
          max="100"
          bind:value={volume}
          on:input={() => changeVolume(volume)}
          class="w-full h-1.5 bg-coffee-200 rounded-full appearance-none cursor-pointer outline-none"
        />
      </div>
      
      <!-- Player controls -->
      <div class="flex justify-between items-center">
        <!-- Previous track -->
        <button
          on:click={playPrevTrack}
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-coffee-100 transition-colors"
          aria-label="Previous track"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-coffee-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <!-- Play/Pause button -->
        <button 
          on:click={togglePlay} 
          class="w-12 h-12 flex items-center justify-center rounded-full {playing ? 'bg-coffee-200' : 'bg-coffee-100'} hover:bg-coffee-300 transition-colors"
          aria-label={playing ? 'Pause music' : 'Play music'}
        >
          {#if playing}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-coffee-800" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-coffee-800" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
          {/if}
        </button>
        
        <!-- Next track -->
        <button
          on:click={playNextTrack}
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-coffee-100 transition-colors"
          aria-label="Next track"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-coffee-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Track info at bottom -->
      <div class="text-xs text-coffee-600 text-center mt-2">
        Track {currentTrack + 1}/{MUSIC_OPTIONS.length}
      </div>
    </div>
  {/if}
  
  <!-- Hidden player container -->
  <div id="youtube-player" class="hidden"></div>
</div>

<style>
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Volume slider styling for various browsers */
  input[type=range] {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    height: 12px;
  }
  
  /* Track styling */
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: #e2d5c6;
    border-radius: 999px;
  }
  
  input[type=range]::-moz-range-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: #e2d5c6;
    border-radius: 999px;
  }
  
  /* Thumb styling */
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: #8B5A2B;
    cursor: pointer;
    margin-top: -5px;
  }
  
  input[type=range]::-moz-range-thumb {
    height: 14px;
    width: 14px;
    border-radius: 50%;
    background: #8B5A2B;
    cursor: pointer;
    border: none;
  }
  
  /* Focus styling */
  input[type=range]:focus {
    outline: none;
  }
  
  input[type=range]:focus::-webkit-slider-runnable-track {
    background: #d4c0a9;
  }
</style>