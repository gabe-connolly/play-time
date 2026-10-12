<script>
  import { getDisplayName } from '$lib/utils/displayName.js';
  import { createTouchDrag, readDropPayload } from '$lib/utils/touchDrag.js';

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

  function dropOnSlot(payload, slotIndex) {
    if (!payload || !onDropPlayer) return;
    onDropPlayer(payload.playerId, position.name, slotIndex, slots[slotIndex]?.id);
  }

  function handleDragStart(e, player, slotIndex) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(slotPayload(player, slotIndex)));
  }

  function slotPayload(player, slotIndex) {
    return { playerId: player.id, sourceType: 'field', sourcePosition: position.name, sourceSlotIndex: slotIndex };
  }

  // One touch tracker per slot, rebuilt when the slot count changes.
  const touches = $derived(
    slots.map((_, idx) => createTouchDrag(() => (slots[idx] ? slotPayload(slots[idx], idx) : null)))
  );
</script>

<div class="bg-green-800 rounded-lg p-3">
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-white font-semibold">{position.name}</h3>
    <span class="text-white text-sm">
      {players.length}/{needed}
    </span>
  </div>

  <div class="flex flex-wrap gap-2 justify-center">
    {#each slots as player, idx (idx)}
      <button
        class={`${position.color} rounded-lg p-3 text-center min-h-[60px] w-[180px] touch-none flex flex-col items-center justify-center hover:ring-2 hover:ring-white ${
          substitutingPlayerId === player?.id ? 'ring-4 ring-white' : ''
        } ${!player ? 'border-2 border-dashed border-white/70' : ''}`}
        onclick={() => player && onPlayerClick?.(player.id)}
        aria-disabled={!player}
        ondragover={handleDragOver}
        ondrop={(e) => { e.preventDefault(); dropOnSlot(readDropPayload(e), idx); }}
        onplayertouchdrop={(e) => dropOnSlot(e.detail, idx)}
        draggable={!!player}
        ondragstart={(e) => player && handleDragStart(e, player, idx)}
        ontouchstart={touches[idx].start}
        ontouchmove={touches[idx].move}
        ontouchend={touches[idx].end}
        ontouchcancel={touches[idx].cancel}
        data-drop-zone
        data-slot-index={idx}
        data-position={position.name}
      >
        {#if player}
          <div class="text-xs text-gray-800 mb-1">{getDirectionalLabel(idx, needed)}</div>
          <div class="font-semibold text-sm">
            {getDisplayName(player, displayFormat)}
          </div>
          {#if player.jerseyNumber}
            <div class="text-xs mt-1">#{player.jerseyNumber}</div>
          {/if}
          {#if substitutingPlayerId === player.id}
            <div class="text-xs mt-1 px-1.5 rounded bg-red-900 text-white font-bold">
              Subbing out
            </div>
          {/if}
        {:else}
          <div class="text-xs text-gray-800 mb-1">{getDirectionalLabel(idx, needed)}</div>
          <div class="text-sm text-gray-800">Empty</div>
        {/if}
      </button>
    {/each}
  </div>
</div>
