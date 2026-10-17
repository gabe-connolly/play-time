<script>
  import { ArrowRight } from 'lucide-svelte';
  import PlayerCard from './PlayerCard.svelte';
  import { readDropPayload } from '$lib/utils/touchDrag.js';
  import { getDirectionalAbbr } from '$lib/utils/slotLabel.js';

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
    onCancelSelection = null,
    onDropToBench = null
  } = $props();

  const benchPlayers = $derived(players.filter(p => p.isOnBench()));
  // While anyone is lined up to go in, every row reserves the tag column so the cards stay one width
  const anyIncoming = $derived(benchPlayers.some(p => p.pendingPosition !== null));
  // A selection only counts while that player is still on the bench
  const hasBenchSelection = $derived(benchPlayers.some(p => p.id === selectedPlayerId));

  // Bench players already lined up to sub in are tagged with the slot they're going to, e.g. "DEF L"
  function incomingTag(player) {
    if (player.pendingPosition === null) return null;
    const abbr = sport.positions.find(pos => pos.name === player.pendingPosition)?.abbr ?? player.pendingPosition;
    const needed = formationStatus[player.pendingPosition]?.needed ?? 0;
    return `${abbr} ${getDirectionalAbbr(player.pendingPositionIndex, needed)}`;
  }

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
        {@const tag = incomingTag(player)}
        <div class="flex items-center gap-2">
          <div class="flex-1 min-w-0">
            <PlayerCard
              {player}
              {displayFormat}
              isSelected={selectedPlayerId === player.id}
              {showPlayTime}
              {clockMs}
              onSelect={onSelectPlayer}
              draggable={!isSubstituting}
            />
          </div>
          {#if anyIncoming}
            <div class="w-24 shrink-0 flex items-center gap-1 text-orange-800">
              {#if tag}
                <ArrowRight size={20} strokeWidth={2.5} aria-label="going to" />
                <span class="flex-1 text-center text-xs font-semibold px-1.5 py-1 rounded bg-orange-800 text-white">{tag}</span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    {#if !isSubstituting && hasBenchSelection}
      <div>
        <h3 class="font-semibold mb-2">Assign to Position:</h3>
        <div class="flex gap-2 flex-wrap">
          {#each sport.positions as pos}
            {@const status = formationStatus[pos.name]}
            {@const hasSpace = status && status.hasSpace}

            <button
              class={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
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
        {#if onCancelSelection}
          <button
            class="mt-6 px-3 py-2 rounded-lg text-sm font-medium bg-red-800 text-white hover:bg-red-900"
            onclick={onCancelSelection}
          >
            Cancel
          </button>
        {/if}
      </div>
    {/if}
  {/if}
</div>
