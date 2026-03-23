<script>
  import PositionGroup from './PositionGroup.svelte';

  let {
    sport,
    formation,
    players,
    displayFormat = 'full',
    substitutingPlayerId = null,
    isPendingMode = false,
    hasPendingWork = false,
    onPlayerClick,
    onDropPlayer = null,
    onViewActive = null,
    onViewPending = null,
    onPrepareSubs = null,
    onCommitSubs = null,
    onDiscardSubs = null
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
    <div class="flex items-center justify-between mb-4">
      <!-- Left: label -->
      <h2 class="text-white text-lg font-bold w-28">
        {isPendingMode ? 'Pending' : 'Field'}
      </h2>

      <!-- Center: view toggle -->
      <div>
        {#if hasPendingWork}
          <div class="flex rounded-lg overflow-hidden border border-white/30">
            <button
              class={`px-2.5 py-1 text-xs font-medium transition-colors ${
                !isPendingMode
                  ? 'bg-white text-green-800'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onclick={onViewActive}
            >
              Active
            </button>
            <button
              class={`px-2.5 py-1 text-xs font-medium transition-colors ${
                isPendingMode
                  ? 'bg-white text-orange-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              onclick={onViewPending}
            >
              Pending
            </button>
          </div>
        {/if}
      </div>

      <!-- Right: sub actions -->
      <div class="w-28 flex justify-end gap-1.5">
        {#if hasPendingWork}
          <button
            class="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 text-green-800 hover:bg-white transition-colors"
            onclick={onCommitSubs}
          >
            Sub Now
          </button>
          <button
            class="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
            onclick={onDiscardSubs}
          >
            Discard
          </button>
        {:else}
          <button
            class="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/20 text-white hover:bg-white/30 transition-colors"
            onclick={onPrepareSubs}
          >
            Prepare Subs
          </button>
        {/if}
      </div>
    </div>
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
