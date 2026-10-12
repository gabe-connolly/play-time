<script>
  import PlayerCard from './PlayerCard.svelte';
  import { readDropPayload } from '$lib/utils/touchDrag.js';

  let {
    players,
    sport,
    formationStatus,
    displayFormat = 'full',
    selectedPlayerId = null,
    isSubstituting = false,
    showPlayTime = false,
    clockMs = 0,
    onSelectPlayer,
    onAssignPosition,
    onDropToBench = null
  } = $props();

  const benchPlayers = $derived(players.filter(p => p.isOnBench()));

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function dropOnBench(payload) {
    if (payload?.sourceType === 'field' && onDropToBench) {
      onDropToBench(payload.playerId);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    dropOnBench(readDropPayload(e));
  }
</script>

<div class="bg-white rounded-lg p-4" ondragover={handleDragOver} ondrop={handleDrop} onplayertouchdrop={(e) => dropOnBench(e.detail)} data-drop-zone role="region" aria-label="Bench drop zone">
  <h2 class="text-xl font-bold mb-3">Bench ({benchPlayers.length})</h2>

  {#if benchPlayers.length === 0}
    <p class="text-gray-700 text-center py-4">All players are on the field</p>
  {:else}
    <div class="grid grid-cols-1 gap-2 mb-4">
      {#each benchPlayers as player (player.id)}
        <PlayerCard
          {player}
          {displayFormat}
          isSelected={selectedPlayerId === player.id}
          {showPlayTime}
          {clockMs}
          onSelect={onSelectPlayer}
          draggable={!isSubstituting}
        />
      {/each}
    </div>

    {#if !isSubstituting && selectedPlayerId}
      <div>
        <h3 class="font-semibold mb-2">Assign to Position:</h3>
        <div class="flex gap-2 flex-wrap">
          {#each sport.positions as pos}
            {@const status = formationStatus[pos.name]}
            {@const hasSpace = status && status.hasSpace}

            <button
              class={`px-3 py-2 rounded-lg text-sm font-medium ${
                hasSpace
                  ? `${pos.color} text-gray-900 hover:ring-2 hover:ring-gray-800`
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!hasSpace}
              onclick={() => onAssignPosition(pos.name)}
            >
              {pos.abbr} ({status?.current || 0}/{status?.needed || 0})
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
