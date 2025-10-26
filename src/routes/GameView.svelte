<script>
  import { ChevronLeft } from 'lucide-svelte';
  import FieldView from '$lib/components/game/FieldView.svelte';
  import BenchView from '$lib/components/game/BenchView.svelte';
  import SubstitutionPanel from '$lib/components/game/SubstitutionPanel.svelte';
  import { Button } from '$lib/components/shared/Button.svelte';
  import * as teamStore from '$lib/stores/teamStore.svelte.js';
  import * as gameStore from '$lib/stores/gameStore.svelte.js';

  const sport = $derived(teamStore.getSport());
  const formation = $derived(teamStore.getFormation());
  const players = $derived(teamStore.getPlayers());
  const team = $derived(teamStore.getTeam());
  const displayFormat = $derived(gameStore.getDisplayFormat());
  const substitutingPlayerId = $derived(gameStore.getSubstitutingPlayer());
  const selectedBenchPlayerId = $derived(gameStore.getSelectedBenchPlayer());

  const isSubstituting = $derived(gameStore.isSubstituting());
  const formationStatus = $derived(teamStore.getFormationStatus());

  const substitutingPlayer = $derived(
    substitutingPlayerId ? team?.getPlayer(substitutingPlayerId) : null
  );

  function handleFieldPlayerClick(playerId) {
    if (substitutingPlayerId === playerId) {
      gameStore.cancelSubstitution();
    } else {
      gameStore.startSubstitution(playerId);
    }
  }

  function handleBenchPlayerSelect(playerId) {
    if (isSubstituting) {
      gameStore.selectBenchPlayer(playerId);
    }
  }

  function handleAssignPosition(positionName) {
    if (selectedBenchPlayerId) {
      teamStore.assignPlayerToPosition(selectedBenchPlayerId, positionName);
      gameStore.selectBenchPlayer(null);
    }
  }

  function handleMoveToBench() {
    if (substitutingPlayerId) {
      teamStore.movePlayerToBench(substitutingPlayerId);
      gameStore.cancelSubstitution();
    }
  }

  function handleCompleteSubstitution() {
    if (substitutingPlayerId && selectedBenchPlayerId) {
      teamStore.substitutePlayers(substitutingPlayerId, selectedBenchPlayerId);
      gameStore.cancelSubstitution();
    }
  }
</script>

<div class="min-h-screen bg-gray-100 p-4">
  <div class="max-w-6xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg p-6 mb-4">
      <div class="flex items-center justify-between mb-6">
        <button
          class="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          onclick={gameStore.goToSetup}
        >
          <ChevronLeft size={20} /> Back to Setup
        </button>
        <h1 class="text-2xl font-bold text-gray-800">
          {sport?.name} - {formation?.name}
        </h1>
        <div class="w-32"></div>
      </div>

      <FieldView
        {sport}
        {formation}
        {players}
        {displayFormat}
        {substitutingPlayerId}
        onPlayerClick={handleFieldPlayerClick}
      />

      {#if isSubstituting && substitutingPlayer}
        <SubstitutionPanel
          {substitutingPlayer}
          {selectedBenchPlayerId}
          {displayFormat}
          onMoveToBench={handleMoveToBench}
          onCompleteSubstitution={handleCompleteSubstitution}
          onCancel={gameStore.cancelSubstitution}
        />
      {/if}

      <BenchView
        {players}
        {sport}
        {formationStatus}
        {displayFormat}
        selectedPlayerId={selectedBenchPlayerId}
        {isSubstituting}
        onSelectPlayer={handleBenchPlayerSelect}
        onAssignPosition={handleAssignPosition}
      />
    </div>
  </div>
</div>
