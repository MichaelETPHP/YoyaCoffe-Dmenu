<script>
  import { onMount, onDestroy } from 'svelte';
  
  let playerReady = false;
  let playing = false;
  let playerElement;
  let player;
  
  onMount(() => {
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
        videoId: 'MYPVQccHhAQ', // Coffee Shop Ambience
        playerVars: {
          autoplay: 0,
          controls: 0,
          showinfo: 0,
          rel: 0,
          fs: 0,
          modestbranding: 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };
  });
  
  function onPlayerReady(event) {
    playerReady = true;
    // Set volume to a comfortable level
    player.setVolume(20);
  }
  
  function onPlayerStateChange(event) {
    // Update playing state based on player state
    playing = event.data === YT.PlayerState.PLAYING;
  }
  
  function togglePlay() {
    if (!playerReady) return;
    
    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }
  
  onDestroy(() => {
    // Clean up player when component is destroyed
    if (player) {
      player.stopVideo();
    }
  });
</script>

<div class="fixed bottom-4 right-4 z-50">
  <div class="bg-white rounded-full shadow-lg p-2 flex items-center">
    <button 
      on:click={togglePlay} 
      class="w-10 h-10 flex items-center justify-center rounded-full {playing ? 'bg-coffee-200' : 'bg-coffee-100'} hover:bg-coffee-300 transition-colors"
      aria-label={playing ? 'Pause coffee shop ambience' : 'Play coffee shop ambience'}
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
    
    <div class="ml-2 text-coffee-800 font-medium text-sm hidden md:block">
      {playing ? 'Now Playing: Coffee Shop Ambience' : 'Play Ambience'}
    </div>
  </div>
  
  <!-- Hidden player container -->
  <div id="youtube-player" class="hidden"></div>
</div>