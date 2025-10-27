<script>
  import PositionGroup from './PositionGroup.svelte';

  let {
    sport,
    formation,
    players,
    displayFormat = 'full',
    substitutingPlayerId = null,
    isPendingMode = false,
    onPlayerClick,
    onDropPlayer = null
  } = $props();

  const fieldPlayers = $derived(
    isPendingMode 
      ? players.filter(p => p.pendingPosition !== null)
      : players.filter(p => p.isOnField())
  );

  const positionGroups = $derived(
    sport.positions.map(pos => {
      const posPlayers = isPendingMode
        ? fieldPlayers.filter(p => p.pendingPosition === pos.name)
        : fieldPlayers.filter(p => p.position === pos.name);
      const needed = formation.getPositionCount(pos.name);

      // Sort players by their position index to maintain slot order
      const sortedPlayers = posPlayers.sort((a, b) => {
        const aIndex = isPendingMode ? (a.pendingPositionIndex ?? 999) : (a.positionIndex ?? 999);
        const bIndex = isPendingMode ? (b.pendingPositionIndex ?? 999) : (b.positionIndex ?? 999);
        return aIndex - bIndex;
      });

      return {
        position: pos,
        players: sortedPlayers,
        needed
      };
    }).reverse() // Reverse to show offensive (Forward) at top, defensive (Goalkeeper) at bottom
  );
</script>

<div class="bg-green-600 rounded-lg p-6 mb-6">
  <div class="bg-green-500 rounded-lg p-4">
    <h2 class="text-white text-xl font-bold mb-4 text-center">
      {isPendingMode ? 'Pending Field' : 'Field'}
    </h2>
    <div class="space-y-4">
      {#each positionGroups as group (group.position.name)}
        <PositionGroup
          position={group.position}
          players={group.players}
          needed={group.needed}
          {displayFormat}
          {substitutingPlayerId}
          {isPendingMode}
          {onPlayerClick}
          {onDropPlayer}
        />
      {/each}
    </div>
  </div>
</div>
