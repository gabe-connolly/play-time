<script>
  import PlayerCard from './PlayerCard.svelte';

  let {
    players,
    sport,
    formationStatus,
    displayFormat = 'full',
    selectedPlayerId = null,
    isSubstituting = false,
    onSelectPlayer,
    onAssignPosition
  } = $props();

  const benchPlayers = $derived(players.filter(p => p.isOnBench()));
</script>

<div class="bg-gray-50 rounded-lg p-4">
  <h2 class="text-xl font-bold mb-3">Bench ({benchPlayers.length})</h2>

  {#if benchPlayers.length === 0}
    <p class="text-gray-500 text-center py-4">All players are on the field</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
      {#each benchPlayers as player (player.id)}
        <PlayerCard
          {player}
          {displayFormat}
          isSelected={selectedPlayerId === player.id}
          onSelect={onSelectPlayer}
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
                  ? `${pos.color} hover:opacity-80`
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
