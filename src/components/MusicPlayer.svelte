<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Classical coffee shop music playlist
  const MUSIC_OPTIONS = [
    { id: 'MYPVQccHhAQ', title: 'Coffee Shop Ambience' },
    { id: 'upALcV1NTnY', title: 'Classical Piano' },
    { id: 'VMAPTo7RVCo', title: 'Jazz Coffee' }
  ];
  
  let playerReady = false;
  let playing = false;
  let currentTrack = 0;
  let volume = 20; // Default low volume
  let player;
  let showControls = false;
  
  onMount(() => {
    // Check if music was playing in previous session
    const savedState = localStorage.getItem('yoyaCoffeeMusic');
    if (savedState) {
      const state = JSON.parse(savedState);
      volume = state.volume || 20;
      currentTrack = state.track || 0;
      // We don't autoplay, user will need to click the button
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
  
  function toggleControls() {
    showControls = !showControls;
  }
  
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
  <div class="bg-white bg-opacity-95 rounded-full shadow-lg p-2 flex items-center overflow-hidden relative">
    <!-- Primary play/pause button -->
    <button 
      on:click={togglePlay} 
      class="w-10 h-10 flex items-center justify-center rounded-full {playing ? 'bg-coffee-200' : 'bg-coffee-100'} hover:bg-coffee-300 transition-colors"
      aria-label={playing ? 'Pause music' : 'Play music'}
    >
      {#if playing}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-coffee-800" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-coffee-800" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
        </svg>
      {/if}
    </button>
    
    <!-- Track info - only shown on larger screens or when player is active -->
    <div class="ml-2 text-coffee-800 font-medium text-sm {!playing && !showControls ? 'hidden md:block' : ''}">
      {playing ? `♪ ${MUSIC_OPTIONS[currentTrack].title}` : 'Play Music'}
    </div>
    
    <!-- Toggle controls button -->
    <button
      on:click={toggleControls}
      class="ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-coffee-100 transition-colors"
      aria-label="Toggle music controls"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-coffee-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" class="transition-transform duration-300 {showControls ? 'rotate-180' : ''}" />
      </svg>
    </button>
  </div>
  
  <!-- Extended controls - displayed when showControls is true -->
  {#if showControls}
    <div class="mt-2 bg-white bg-opacity-95 rounded-xl shadow-lg p-3 animate-fadeIn">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-coffee-800">Volume</span>
        <div class="flex items-center">
          <!-- Volume down -->
          <button
            on:click={() => changeVolume(Math.max(0, volume - 10))}
            class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-coffee-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-coffee-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9" />
            </svg>
          </button>
          
          <!-- Volume display -->
          <span class="w-8 text-center text-xs text-coffee-700">{volume}%</span>
          
          <!-- Volume up -->
          <button
            on:click={() => changeVolume(Math.min(100, volume + 10))}
            class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-coffee-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-coffee-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Track selection -->
      <div class="flex justify-between items-center">
        <!-- Previous track -->
        <button
          on:click={playPrevTrack}
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-coffee-100"
          aria-label="Previous track"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-coffee-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <!-- Track info -->
        <span class="text-xs text-coffee-700 text-center whitespace-nowrap mx-1 px-1">
          Track {currentTrack + 1}/{MUSIC_OPTIONS.length}
        </span>
        
        <!-- Next track -->
        <button
          on:click={playNextTrack}
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-coffee-100"
          aria-label="Next track"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-coffee-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
</style>