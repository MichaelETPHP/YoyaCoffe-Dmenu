<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Game state
  let board = Array(9).fill(null);
  let currentPlayer = '☕'; // Coffee cup for player, company logo for computer
  let companyPlayer = '🥤'; // Using a cup emoji as a placeholder, will be replaced with logo image
  let winner = null;
  let gameStatus = 'Play a relaxing game while you enjoy your coffee!';
  let winningLine = [];
  let gameOver = false;
  let playerScore = 0;
  let computerScore = 0;
  let isPlayerTurn = true;
  
  // Animation states
  let boardVisible = false;
  let cells = Array(9).fill(false); // Tracks if each cell has animated in
  let winAnimation = false;
  
  onMount(() => {
    setTimeout(() => {
      boardVisible = true;
      animateCellsSequentially();
    }, 300);
  });
  
  function animateCellsSequentially() {
    for (let i = 0; i < 9; i++) {
      setTimeout(() => {
        cells[i] = true;
        cells = [...cells]; // Trigger reactivity
      }, i * 100);
    }
  }
  
  function handleClick(index) {
    // Don't allow moves on filled squares or if game is over
    if (board[index] || winner || !isPlayerTurn) return;
    
    makeMove(index);
    
    // Computer's turn after a short delay
    if (!winner && !isBoardFull()) {
      isPlayerTurn = false;
      setTimeout(computerMove, 700);
    }
  }
  
  function makeMove(index) {
    board[index] = currentPlayer;
    board = [...board]; // Force reactivity
    
    checkWinner();
    
    if (!winner) {
      // Switch players
      currentPlayer = currentPlayer === '☕' ? companyPlayer : '☕';
    }
  }
  
  function computerMove() {
    if (winner || isBoardFull()) return;
    
    // Try to find a good move
    let index = findBestMove();
    
    // Make the move
    makeMove(index);
    isPlayerTurn = true;
  }
  
  function findBestMove() {
    // First try to win
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = companyPlayer;
        if (calculateWinner().winner) {
          board[i] = null; // Reset
          return i;
        }
        board[i] = null; // Reset
      }
    }
    
    // Then try to block
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = '☕';
        if (calculateWinner().winner) {
          board[i] = null; // Reset
          return i;
        }
        board[i] = null; // Reset
      }
    }
    
    // Try center
    if (!board[4]) return 4;
    
    // Try corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !board[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Try any available space
    const available = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
    return available[Math.floor(Math.random() * available.length)];
  }
  
  function checkWinner() {
    const result = calculateWinner();
    winner = result.winner;
    winningLine = result.line;
    
    if (winner) {
      winAnimation = true;
      gameOver = true;
      if (winner === '☕') {
        playerScore++;
        gameStatus = "You won! ☕ rules!";
      } else {
        computerScore++;
        gameStatus = "The coffee shop won! Yoya rules!";
      }
    } else if (isBoardFull()) {
      gameOver = true;
      gameStatus = "It's a draw! Another round?";
    } else {
      gameStatus = isPlayerTurn 
        ? "Your turn - place your ☕"
        : "The coffee shop is thinking...";
    }
  }
  
  function calculateWinner() {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontals
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticals
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { 
          winner: board[a],
          line: line
        };
      }
    }
    
    return { winner: null, line: [] };
  }
  
  function isBoardFull() {
    return board.every(cell => cell !== null);
  }
  
  function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = '☕';
    winner = null;
    gameStatus = 'Play a relaxing game while you enjoy your coffee!';
    winningLine = [];
    gameOver = false;
    isPlayerTurn = true;
    winAnimation = false;
    
    // Reset cell animations
    cells = Array(9).fill(false);
    setTimeout(() => {
      animateCellsSequentially();
    }, 300);
  }
  
  function closeGame() {
    dispatch('close');
  }
  
  // Helper to check if a cell is in the winning line
  function isWinningCell(index) {
    return winningLine.includes(index);
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
  <div 
    class="relative bg-coffee-50 rounded-2xl shadow-2xl max-w-md w-full mx-auto p-5 transform transition-all duration-500 {boardVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}"
  >
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-serif font-bold text-coffee-800">Yoya Coffee Tic-Tac-Toe</h2>
      <button 
        on:click={closeGame} 
        class="text-coffee-500 hover:text-coffee-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Game Status -->
    <div class="text-center mb-4">
      <p class="text-coffee-700 font-medium">{gameStatus}</p>
    </div>
    
    <!-- Score -->
    <div class="flex justify-center gap-6 mb-6">
      <div class="text-center">
        <p class="text-coffee-600">You</p>
        <p class="text-2xl font-bold text-coffee-800">{playerScore}</p>
      </div>
      <div class="text-center">
        <p class="text-coffee-600">Coffee Shop</p>
        <p class="text-2xl font-bold text-coffee-800">{computerScore}</p>
      </div>
    </div>
    
    <!-- Game Board -->
    <div class="grid grid-cols-3 gap-3 mb-6 mx-auto max-w-xs">
      {#each board as cell, i}
        <button 
          on:click={() => handleClick(i)}
          class="w-full aspect-square bg-white rounded-lg shadow transition-all duration-300 flex items-center justify-center
            {cells[i] ? 'scale-100 opacity-100' : 'scale-90 opacity-0'} 
            {isWinningCell(i) && winAnimation ? 'bg-coffee-200 animate-pulse' : ''}
            hover:bg-coffee-100 hover:shadow-md"
          disabled={!isPlayerTurn || gameOver}
        >
          {#if cell === companyPlayer}
            <img src="/images/yoya-logo-transparent.png" alt="Yoya Logo" class="w-8 h-8 object-contain" />
          {:else if cell}
            <span class="text-3xl">{cell}</span>
          {/if}
        </button>
      {/each}
    </div>
    
    <!-- Reset Button -->
    <div class="text-center">
      <button 
        on:click={resetGame}
        class="px-6 py-2 bg-coffee-600 text-white font-medium rounded-lg hover:bg-coffee-700 transition-colors transform hover:scale-105 duration-200"
      >
        Play Again
      </button>
    </div>
  </div>
</div>

<style>
  button:disabled {
    cursor: not-allowed;
    opacity: 0.9;
  }
  
  .animate-pulse {
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      background-color: rgba(225, 200, 175, 0.5);
      transform: scale(1);
    }
    50% {
      background-color: rgba(225, 200, 175, 1);
      transform: scale(1.05);
    }
  }
</style>