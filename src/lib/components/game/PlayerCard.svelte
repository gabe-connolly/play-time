<script>
  import { Edit2, X } from 'lucide-svelte';
  import { getDisplayName } from '$lib/utils/displayName.js';

  let {
    player,
    displayFormat = 'full',
    isSelected = false,
    showActions = false,
    draggable = false,
    sourceType = 'bench',
    onSelect = null,
    onEdit = null,
    onDelete = null
  } = $props();

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
  <div>
    <span class="font-medium">{getDisplayName(player, displayFormat)}</span>
    {#if player.jerseyNumber}
      <span class="text-gray-500 ml-2">#{player.jerseyNumber}</span>
    {/if}
    {#if player.nickname && displayFormat !== 'nickname'}
      <span class="text-gray-500 text-sm ml-2">({player.nickname})</span>
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
