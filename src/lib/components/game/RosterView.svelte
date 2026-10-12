<script>
  import PlayerCard from './PlayerCard.svelte';
  import { getDisplayName } from '$lib/utils/displayName.js';
  import { readDropPayload } from '$lib/utils/touchDrag.js';

  let {
    players,
    displayFormat = 'full',
    showPlayTime = false,
    clockMs = 0,
    absentPlayers = [],
    readOnly = false,
    onDropToBench = null,
    onToggleAvailability = null,
    onAddLatePlayer = null
  } = $props();

  function getAssignmentBadges(player) {
    const badges = [];
    if (player.isOut()) {
      badges.push({ label: 'Out', color: 'bg-gray-800 text-white' });
    }
    if (player.isOnField()) {
      badges.push({ label: `Active: ${player.position}`, color: 'bg-blue-800 text-white' });
    }
    if (player.pendingPosition !== null) {
      badges.push({ label: `Pending: ${player.pendingPosition}`, color: 'bg-orange-800 text-white' });
    }
    return badges;
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

<div class="bg-white rounded-lg p-4" ondragover={handleDragOver} ondrop={handleDrop} onplayertouchdrop={(e) => dropOnBench(e.detail)} data-drop-zone role="region" aria-label="Full Roster drop zone">
  <h2 class="text-xl font-bold mb-3">Full Roster ({players.length})</h2>

  {#if players.length === 0}
    <p class="text-gray-700 text-center py-4">No players in this game</p>
  {:else}
    <div class="grid grid-cols-1 gap-2">
      {#each players as player (player.id)}
        {@const badges = getAssignmentBadges(player)}
        <div>
          <PlayerCard
            {player}
            {displayFormat}
            {showPlayTime}
            {clockMs}
            draggable={!readOnly && !player.isOut()}
            sourceType="roster"
          />
          <div class="flex flex-wrap items-center gap-1 mt-1 ml-3">
            {#each badges as badge (badge.label)}
              <span class={`text-xs px-2 py-0.5 rounded ${badge.color} font-medium`}>{badge.label}</span>
            {/each}
            {#if onToggleAvailability && !readOnly}
              <button
                class="ml-auto text-xs px-2 py-1 rounded font-medium {player.isOut()
                  ? 'bg-green-800 text-white hover:bg-green-900'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}"
                onclick={() => onToggleAvailability(player.id, player.isOut())}
              >
                {player.isOut() ? 'Back in' : 'Mark out'}
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if absentPlayers.length > 0 && onAddLatePlayer && !readOnly}
    <h3 class="font-semibold text-gray-900 mt-5 mb-2">Not playing today</h3>
    <ul class="space-y-1">
      {#each absentPlayers as player (player.id)}
        <li class="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
          <span class="text-gray-800">{getDisplayName(player, displayFormat)}</span>
          <button
            class="text-xs px-2 py-1 rounded font-medium bg-green-800 text-white hover:bg-green-900"
            onclick={() => onAddLatePlayer(player.id)}
          >
            Arrived
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
