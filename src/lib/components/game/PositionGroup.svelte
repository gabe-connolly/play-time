<script>
  import { getDisplayName } from '$lib/utils/displayName.js';

  let {
    position,
    players,
    needed,
    displayFormat = 'full',
    substitutingPlayerId = null,
    onPlayerClick,
    onDropPlayer = null
  } = $props();

  const slots = $derived(
    Array(needed).fill(null).map((_, i) => players[i] || null)
  );

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, slotIndex) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (onDropPlayer) {
      const currentPlayer = slots[slotIndex];
      onDropPlayer(data.playerId, position.name, currentPlayer?.id);
    }
  }

  function handleDragStart(e, player) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({
      playerId: player.id,
      sourceType: 'field',
      sourcePosition: position.name
    }));
  }
</script>

<div class="bg-white/10 rounded-lg p-3">
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-white font-semibold">{position.name}</h3>
    <span class="text-white text-sm">
      {players.length}/{needed}
    </span>
  </div>

  <div class="grid grid-cols-4 gap-2">
    {#each slots as player, idx (idx)}
      <button
        class={`${position.color} rounded-lg p-3 text-center min-h-[60px] flex flex-col items-center justify-center hover:opacity-80 transition-opacity ${
          substitutingPlayerId === player?.id ? 'ring-2 ring-red-500' : ''
        } ${!player ? 'border-2 border-dashed border-white/30' : ''}`}
        onclick={() => player && onPlayerClick?.(player.id)}
        disabled={!player}
        ondragover={handleDragOver}
        ondrop={(e) => handleDrop(e, idx)}
        draggable={!!player}
        ondragstart={(e) => player && handleDragStart(e, player)}
      >
        {#if player}
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
          <div class="text-sm text-gray-600">Empty</div>
        {/if}
      </button>
    {/each}
  </div>
</div>
