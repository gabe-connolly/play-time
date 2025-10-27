<script>
  import { getDisplayName } from '$lib/utils/displayName.js';

  let {
    position,
    players,
    needed,
    displayFormat = 'full',
    substitutingPlayerId = null,
    isPendingMode = false,
    onPlayerClick,
    onDropPlayer = null
  } = $props();

  // Map players to specific slots based on their positionIndex
  const slots = $derived(
    Array(needed).fill(null).map((_, slotIndex) => {
      const indexKey = isPendingMode ? 'pendingPositionIndex' : 'positionIndex';
      return players.find(p => p[indexKey] === slotIndex) || null;
    })
  );

  // Determine directional label based on slot position
  function getDirectionalLabel(index, total) {
    if (total === 1) return 'Center';
    if (total === 2) return index === 0 ? 'Left' : 'Right';
    if (total === 3) {
      if (index === 0) return 'Left';
      if (index === 1) return 'Center';
      return 'Right';
    }
    if (total === 4) {
      if (index === 0) return 'Left';
      if (index === 1) return 'Center Left';
      if (index === 2) return 'Center Right';
      return 'Right';
    }
    if (total === 5) {
      if (index === 0) return 'Left';
      if (index === 1) return 'Center Left';
      if (index === 2) return 'Center';
      if (index === 3) return 'Center Right';
      return 'Right';
    }
    return `Position ${index + 1}`;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, slotIndex) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (onDropPlayer) {
      const currentPlayer = slots[slotIndex];
      onDropPlayer(data.playerId, position.name, slotIndex, currentPlayer?.id, data.sourcePosition, data.sourceSlotIndex);
    }
  }

  function handleDragStart(e, player, slotIndex) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      playerId: player.id,
      sourceType: 'field',
      sourcePosition: position.name,
      sourceSlotIndex: slotIndex
    }));
  }

  // Touch event handlers for mobile support
  let touchStartData = null;

  function handleTouchStart(e, player, slotIndex) {
    if (!player) return;
    e.preventDefault();
    touchStartData = {
      playerId: player.id,
      sourceType: 'field',
      sourcePosition: position.name,
      sourceSlotIndex: slotIndex,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    };
    // Add visual feedback
    e.currentTarget.style.opacity = '0.5';
  }

  function handleTouchMove(e) {
    if (!touchStartData) return;
    e.preventDefault();
  }

  function handleTouchEnd(e, slotIndex) {
    if (!touchStartData) return;
    e.preventDefault();
    
    // Reset visual feedback on source
    const sourceElements = document.querySelectorAll('[style*="opacity: 0.5"]');
    sourceElements.forEach(el => el.style.opacity = '');
    
    // Find the element at the touch end position
    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (targetElement) {
      // Find the closest button with data-slot attribute
      const dropTarget = targetElement.closest('[data-slot-index]');
      if (dropTarget && onDropPlayer) {
        const targetSlotIndex = parseInt(dropTarget.getAttribute('data-slot-index'));
        const targetPosition = dropTarget.getAttribute('data-position');
        
        if (targetPosition === position.name) {
          const currentPlayer = slots[targetSlotIndex];
          onDropPlayer(
            touchStartData.playerId,
            position.name,
            targetSlotIndex,
            currentPlayer?.id,
            touchStartData.sourcePosition,
            touchStartData.sourceSlotIndex
          );
        }
      }
    }
    
    touchStartData = null;
  }
</script>

<div class="bg-white/10 rounded-lg p-3">
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-white font-semibold">{position.name}</h3>
    <span class="text-white text-sm">
      {players.length}/{needed}
    </span>
  </div>

  <div class="flex flex-wrap gap-2 justify-center">
    {#each slots as player, idx (idx)}
      <button
        class={`${position.color} rounded-lg p-3 text-center min-h-[60px] flex-1 min-w-[150px] max-w-[200px] flex flex-col items-center justify-center hover:opacity-80 transition-opacity ${
          substitutingPlayerId === player?.id ? 'ring-2 ring-red-500' : ''
        } ${!player ? 'border-2 border-dashed border-white/30' : ''}`}
        onclick={() => player && onPlayerClick?.(player.id)}
        disabled={!player}
        ondragover={handleDragOver}
        ondrop={(e) => handleDrop(e, idx)}
        draggable={!!player}
        ondragstart={(e) => player && handleDragStart(e, player, idx)}
        ontouchstart={(e) => handleTouchStart(e, player, idx)}
        ontouchmove={handleTouchMove}
        ontouchend={(e) => handleTouchEnd(e, idx)}
        data-slot-index={idx}
        data-position={position.name}
      >
        {#if player}
          <div class="text-xs text-gray-500 mb-1 opacity-70">{getDirectionalLabel(idx, needed)}</div>
          <div class="font-semibold text-sm">
            {getDisplayName(player, displayFormat)}
          </div>
          {#if player.jerseyNumber}
            <div class="text-xs mt-1">#{player.jerseyNumber}</div>
          {/if}
          {#if substitutingPlayerId === player.id}
            <div class="text-xs mt-1 text-red-700 font-bold">
              Subbing out
            </div>
          {/if}
        {:else}
          <div class="text-xs text-gray-400 mb-1">{getDirectionalLabel(idx, needed)}</div>
          <div class="text-sm text-gray-600">Empty</div>
        {/if}
      </button>
    {/each}
  </div>
</div>
