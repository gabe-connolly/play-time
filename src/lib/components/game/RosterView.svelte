<script>
  import { getDisplayName } from '$lib/utils/displayName.js';

  let {
    players = [],
    displayFormat = 'full',
    isPendingMode = false
  } = $props();

  // Sort all players alphabetically by last name
  const sortedPlayers = $derived(players.slice().sort((a, b) => {
    return a.lastName.localeCompare(b.lastName);
  }));

  function handleDragStart(e, player) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      playerId: player.id,
      sourceType: player.isOnBench() ? 'bench' : 'field',
      sourcePosition: player.position,
      sourceSlotIndex: player.positionIndex
    }));
  }

  // Touch event handlers for mobile support
  let touchStartData = null;

  function handleTouchStart(e, player) {
    e.preventDefault();
    touchStartData = {
      playerId: player.id,
      sourceType: player.isOnBench() ? 'bench' : 'field',
      sourcePosition: player.position,
      sourceSlotIndex: player.positionIndex,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    };
    e.currentTarget.style.opacity = '0.5';
  }

  function handleTouchMove(e) {
    if (!touchStartData) return;
    e.preventDefault();
  }

  function handleTouchEnd(e) {
    if (!touchStartData) return;
    e.preventDefault();
    
    // Reset visual feedback
    e.currentTarget.style.opacity = '';
    
    // Find the element at the touch end position
    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (targetElement) {
      // Find the closest button with data-slot attribute
      const dropTarget = targetElement.closest('[data-slot-index]');
      if (dropTarget) {
        const event = new CustomEvent('rosterPlayerDrop', {
          detail: {
            playerId: touchStartData.playerId,
            sourceType: touchStartData.sourceType,
            sourcePosition: touchStartData.sourcePosition,
            sourceSlotIndex: touchStartData.sourceSlotIndex,
            targetElement: dropTarget
          },
          bubbles: true
        });
        dropTarget.dispatchEvent(event);
      }
    }
    
    touchStartData = null;
  }
</script>

<div class="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
  <div class="p-4 border-b border-gray-200 bg-gray-50">
    <h2 class="text-xl font-bold text-gray-800">Roster</h2>
    <p class="text-sm text-gray-600">Total: {players.length}</p>
  </div>
  
  <div class="flex-1 overflow-y-auto p-4">
    {#if players.length === 0}
      <div class="text-center py-8 text-gray-500">
        <p>No players on the roster</p>
      </div>
    {:else}
      <div class="space-y-1">
        {#each sortedPlayers as player (player.id)}
          {@const isOnField = isPendingMode ? (player.pendingPosition !== null) : player.isOnField()}
          {@const position = isPendingMode ? player.pendingPosition : player.position}
          
          <div 
            class={`flex items-center justify-between p-2 rounded transition-colors cursor-move ${
              isOnField 
                ? 'bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            draggable={true}
            ondragstart={(e) => handleDragStart(e, player)}
            ontouchstart={(e) => handleTouchStart(e, player)}
            ontouchmove={handleTouchMove}
            ontouchend={handleTouchEnd}
          >
            <div class="flex-1">
              <span class={`font-medium ${isOnField ? 'text-gray-900' : 'text-gray-700'}`}>
                {getDisplayName(player, displayFormat)}
              </span>
              {#if player.jerseyNumber}
                <span class="text-gray-500 text-sm ml-2">#{player.jerseyNumber}</span>
              {/if}
            </div>
            
            {#if isOnField && position}
              <span class="text-xs px-2 py-1 bg-blue-600 text-white rounded font-medium">
                {position}
              </span>
            {:else}
              <span class="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                Bench
              </span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
