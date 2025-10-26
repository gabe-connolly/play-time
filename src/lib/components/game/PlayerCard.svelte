<script>
  import { Edit2, X } from 'lucide-svelte';
  import { getDisplayName } from '$lib/utils/displayName.js';

  let {
    player,
    displayFormat = 'full',
    isSelected = false,
    showActions = false,
    draggable = false,
    onSelect = null,
    onEdit = null,
    onDelete = null
  } = $props();

  function handleDragStart(e) {
    if (!draggable) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      playerId: player.id,
      sourceType: 'bench'
    }));
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
