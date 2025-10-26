<script>
  import PositionGroup from './PositionGroup.svelte';

  let {
    sport,
    formation,
    players,
    displayFormat = 'full',
    substitutingPlayerId = null,
    onPlayerClick
  } = $props();

  const fieldPlayers = $derived(players.filter(p => p.isOnField()));

  const positionGroups = $derived(
    sport.positions.map(pos => {
      const posPlayers = fieldPlayers.filter(p => p.position === pos.name);
      const needed = formation.getPositionCount(pos.name);

      return {
        position: pos,
        players: posPlayers,
        needed
      };
    })
  );
</script>

<div class="bg-green-600 rounded-lg p-6 mb-6">
  <div class="bg-green-500 rounded-lg p-4">
    <h2 class="text-white text-xl font-bold mb-4 text-center">Field</h2>
    <div class="space-y-4">
      {#each positionGroups as group (group.position.name)}
        <PositionGroup
          position={group.position}
          players={group.players}
          needed={group.needed}
          {displayFormat}
          {substitutingPlayerId}
          {onPlayerClick}
        />
      {/each}
    </div>
  </div>
</div>
