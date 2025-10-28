<script>
  import PlayerCard from './PlayerCard.svelte';

  let {
    players,
    displayFormat = 'full',
    fieldMode = 'active',
    onDropToBench = null
  } = $props();

  // All players in the roster
  const rosterPlayers = $derived(players);

  // Check if a player is assigned in active mode
  function isAssignedActive(player) {
    return player.position !== null && player.status === 'on_field';
  }

  // Check if a player is assigned in pending mode
  function isAssignedPending(player) {
    return player.pendingPosition !== null;
  }

  // Get assignment details for a player
  function getAssignmentBadges(player) {
    const badges = [];
    
    if (isAssignedActive(player)) {
      badges.push({
        label: `Active: ${player.position}`,
        color: 'bg-blue-600 text-white'
      });
    }
    
    if (isAssignedPending(player)) {
      badges.push({
        label: `Pending: ${player.pendingPosition}`,
        color: 'bg-orange-600 text-white'
      });
    }
    
    return badges;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.sourceType === 'field' && onDropToBench) {
        onDropToBench(data.playerId);
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error);
    }
  }
</script>

<div class="bg-gray-50 rounded-lg p-4" ondragover={handleDragOver} ondrop={handleDrop} role="region" aria-label="Full Roster drop zone">
  <h2 class="text-xl font-bold mb-3">Full Roster ({rosterPlayers.length})</h2>

  {#if rosterPlayers.length === 0}
    <p class="text-gray-500 text-center py-4">No players in roster</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      {#each rosterPlayers as player (player.id)}
        {@const badges = getAssignmentBadges(player)}
        {@const hasAssignment = badges.length > 0}
        
        <div class="relative">
          <PlayerCard
            {player}
            {displayFormat}
            draggable={true}
            sourceType="roster"
          />
          
          {#if hasAssignment}
            <div class="absolute top-1 right-1 flex flex-col gap-1">
              {#each badges as badge}
                <span class={`text-xs px-2 py-0.5 rounded ${badge.color} font-medium shadow-sm`}>
                  {badge.label}
                </span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
