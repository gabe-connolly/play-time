<script>
  import { ArrowDown } from 'lucide-svelte';
  import { getDisplayName } from '$lib/utils/displayName.js';
  import { createTouchDrag, readDropPayload } from '$lib/utils/touchDrag.js';
  import { getDirectionalLabel } from '$lib/utils/slotLabel.js';

  let {
    position,
    players,
    activePlayers = [],
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

  // In pending mode, who is on the field in each slot right now
  const currentSlots = $derived(
    Array(needed).fill(null).map((_, slotIndex) => activePlayers.find(p => p.positionIndex === slotIndex) || null)
  );

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

<div class="bg-green-800 rounded-lg px-3 py-2 flex-1 flex items-center gap-3">
  <div class="w-24 shrink-0">
    <h3 class="text-white font-semibold leading-tight">{position.name}</h3>
    <span class="text-white text-sm">{players.length}/{needed}</span>
  </div>

  <div class="flex-1 min-w-0 self-stretch flex gap-2 justify-center">
    {#each slots as player, idx (idx)}
      {@const current = currentSlots[idx]}
      <button
        class={`${position.color} rounded-lg px-2 py-2 text-center min-h-[64px] flex-1 min-w-0 max-w-[180px] touch-none flex flex-col items-center justify-center hover:ring-2 hover:ring-white ${
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
        {#if player && substitutingPlayerId === player.id}
          <div class="text-xs px-1.5 rounded bg-red-900 text-white font-bold">Subbing out</div>
        {:else}
          <div class="text-xs text-gray-800">{getDirectionalLabel(idx, needed)}</div>
        {/if}
        {#if isPendingMode && current?.id !== player?.id}
          <div class="text-sm text-gray-800 truncate max-w-full">
            {#if current}{getDisplayName(current, displayFormat)}{:else}Empty{/if}
          </div>
          <ArrowDown class="my-0.5 shrink-0 text-orange-800" size={20} strokeWidth={2.5} aria-label="coming in" />
          <div class="font-semibold text-sm text-gray-900 truncate max-w-full">
            {#if player}
              {getDisplayName(player, displayFormat)}{#if player.jerseyNumber}<span class="font-normal ml-1">#{player.jerseyNumber}</span>{/if}
            {:else}
              Empty
            {/if}
          </div>
        {:else if player}
          <div class="font-semibold text-sm text-gray-900 truncate max-w-full">
            {getDisplayName(player, displayFormat)}{#if player.jerseyNumber}<span class="font-normal ml-1">#{player.jerseyNumber}</span>{/if}
          </div>
        {:else}
          <div class="text-sm text-gray-800">Empty</div>
        {/if}
      </button>
    {/each}
  </div>
</div>
