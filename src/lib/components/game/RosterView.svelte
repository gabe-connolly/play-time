<script>
  import { getDisplayName } from '$lib/utils/displayName.js';

  let {
    players = [],
    displayFormat = 'full'
  } = $props();

  // Separate players by status
  const fieldPlayers = $derived(players.filter(p => p.isOnField()).sort((a, b) => {
    // Sort by position and then by position index
    if (a.position !== b.position) {
      return (a.position || '').localeCompare(b.position || '');
    }
    return (a.positionIndex || 0) - (b.positionIndex || 0);
  }));
  
  const benchPlayers = $derived(players.filter(p => p.isOnBench()).sort((a, b) => {
    // Sort alphabetically by last name
    return a.lastName.localeCompare(b.lastName);
  }));
</script>

<div class="h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
  <div class="p-4 border-b border-gray-200 bg-gray-50">
    <h2 class="text-xl font-bold text-gray-800">Roster</h2>
    <p class="text-sm text-gray-600">Total: {players.length}</p>
  </div>
  
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    <!-- Field Players -->
    {#if fieldPlayers.length > 0}
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          On Field ({fieldPlayers.length})
        </h3>
        <div class="space-y-1">
          {#each fieldPlayers as player (player.id)}
            <div class="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <div class="flex-1">
                <span class="font-medium text-gray-900">
                  {getDisplayName(player, displayFormat)}
                </span>
                {#if player.jerseyNumber}
                  <span class="text-gray-500 text-sm ml-2">#{player.jerseyNumber}</span>
                {/if}
              </div>
              {#if player.position}
                <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                  {player.position}
                </span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Bench Players -->
    {#if benchPlayers.length > 0}
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          On Bench ({benchPlayers.length})
        </h3>
        <div class="space-y-1">
          {#each benchPlayers as player (player.id)}
            <div class="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <div class="flex-1">
                <span class="font-medium text-gray-900">
                  {getDisplayName(player, displayFormat)}
                </span>
                {#if player.jerseyNumber}
                  <span class="text-gray-500 text-sm ml-2">#{player.jerseyNumber}</span>
                {/if}
              </div>
              <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                Bench
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if players.length === 0}
      <div class="text-center py-8 text-gray-500">
        <p>No players on the roster</p>
      </div>
    {/if}
  </div>
</div>
