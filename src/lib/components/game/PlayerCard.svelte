<script>
  import { Edit2, X } from 'lucide-svelte';
  import { getDisplayName } from '$lib/utils/displayName.js';
  import { formatPlayTime } from '$lib/utils/formatTime.js';
  import { createTouchDrag } from '$lib/utils/touchDrag.js';

  let {
    player,
    displayFormat = 'full',
    isSelected = false,
    showActions = false,
    showPlayTime = false,
    clockMs = 0,
    draggable = false,
    sourceType = 'bench',
    onSelect = null,
    onEdit = null,
    onDelete = null
  } = $props();

  const currentPlayTime = $derived(showPlayTime ? player.getPlayTimeMs(clockMs) : 0);

  function handleDragStart(e) {
    if (!draggable) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      playerId: player.id,
      sourceType: sourceType
    }));
  }

  const touch = createTouchDrag(
    () => (draggable ? { playerId: player.id, sourceType } : null),
    { verticalScrolls: true }
  );
</script>

<div
  class={`flex items-center justify-between p-3 rounded-lg transition-colors ${
    onSelect ? 'cursor-pointer' : ''
  } ${draggable ? 'cursor-move touch-pan-y' : ''} ${
    isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
  }`}
  onclick={() => onSelect?.(player.id)}
  role={onSelect ? 'button' : 'presentation'}
  tabindex={onSelect ? 0 : undefined}
  draggable={draggable}
  ondragstart={handleDragStart}
  ontouchstart={touch.start}
  ontouchmove={touch.move}
  ontouchend={touch.end}
  ontouchcancel={touch.cancel}
>
  <div class="flex-1 min-w-0 flex items-center gap-2">
    <div class="flex-1 min-w-0">
      <span class="font-medium">{getDisplayName(player, displayFormat)}</span>
      {#if player.jerseyNumber}
        <span class="text-gray-700 ml-2">#{player.jerseyNumber}</span>
      {/if}
      {#if player.nickname && displayFormat !== 'nickname'}
        <span class="text-gray-700 text-sm ml-2">({player.nickname})</span>
      {/if}
    </div>
    {#if showPlayTime}
      <span class="shrink-0 text-xs font-mono tabular-nums px-1.5 py-0.5 rounded {player.isOnField() ? 'bg-green-100 text-green-900' : 'bg-gray-200 text-gray-800'}">
        {formatPlayTime(currentPlayTime, { padMinutes: true })}
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
