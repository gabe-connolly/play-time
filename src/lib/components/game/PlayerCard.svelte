<script>
  import { Edit2, X } from 'lucide-svelte';
  import { getDisplayName } from '$lib/utils/displayName.js';
  import { formatPlayTime } from '$lib/utils/formatTime.js';

  let {
    player,
    displayFormat = 'full',
    isSelected = false,
    showActions = false,
    showPlayTime = false,
    playTimeTick = 0,
    draggable = false,
    sourceType = 'bench',
    onSelect = null,
    onEdit = null,
    onDelete = null
  } = $props();

  const currentPlayTime = $derived.by(() => {
    // Reference playTimeTick to re-derive when it changes
    void playTimeTick;
    return showPlayTime ? player.getCurrentPlayTimeMs() : 0;
  });

  function handleDragStart(e) {
    if (!draggable) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      playerId: player.id,
      sourceType: sourceType
    }));
  }

  // Touch event handlers for mobile support
  let touchStartData = null;

  function handleTouchStart(e) {
    if (!draggable) return;
    e.preventDefault();
    touchStartData = {
      playerId: player.id,
      sourceType: sourceType,
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
        const event = new CustomEvent('benchPlayerDrop', {
          detail: {
            playerId: touchStartData.playerId,
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

<div
  class={`flex items-center justify-between p-3 rounded-lg transition-colors ${
    onSelect ? 'cursor-pointer' : ''
  } ${draggable ? 'cursor-move' : ''} ${
    isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
  }`}
  onclick={() => onSelect?.(player.id)}
  role={onSelect ? 'button' : 'presentation'}
  tabindex={onSelect ? 0 : undefined}
  draggable={draggable}
  ondragstart={handleDragStart}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
>
  <div class="flex items-center gap-2">
    <div>
      <span class="font-medium">{getDisplayName(player, displayFormat)}</span>
      {#if player.jerseyNumber}
        <span class="text-gray-500 ml-2">#{player.jerseyNumber}</span>
      {/if}
      {#if player.nickname && displayFormat !== 'nickname'}
        <span class="text-gray-500 text-sm ml-2">({player.nickname})</span>
      {/if}
    </div>
    {#if showPlayTime}
      <span class="text-xs font-mono tabular-nums px-1.5 py-0.5 rounded {player.isOnField() ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}">
        {formatPlayTime(currentPlayTime)}
      </span>
    {/if}
  </div>

  {#if showActions && (onEdit || onDelete)}
    <div class="flex gap-2">
      {#if onEdit}
        <button
          class="p-2 text-blue-600 hover:bg-blue-50 rounded"
          onclick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
      {/if}
      {#if onDelete}
        <button
          class="p-2 text-red-600 hover:bg-red-50 rounded"
          onclick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
        >
          <X size={16} />
        </button>
      {/if}
    </div>
  {/if}
</div>
