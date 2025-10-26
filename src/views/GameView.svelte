<script>
  import { ChevronLeft } from 'lucide-svelte';
  import FieldView from '$lib/components/game/FieldView.svelte';
  import BenchView from '$lib/components/game/BenchView.svelte';
  import SubstitutionPanel from '$lib/components/game/SubstitutionPanel.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import * as teamStore from '$lib/stores/teamStore.svelte.js';
  import * as gameStore from '$lib/stores/gameStore.svelte.js';

  const sport = $derived(teamStore.getSport());
  const formation = $derived(teamStore.getFormation());
  const players = $derived(teamStore.getPlayers());
  const team = $derived(teamStore.getTeam());
  const displayFormat = $derived(gameStore.getDisplayFormat());
  const substitutingPlayerId = $derived(gameStore.getSubstitutingPlayer());
  const selectedBenchPlayerId = $derived(gameStore.getSelectedBenchPlayer());
  const fieldMode = $derived(gameStore.getFieldMode());

  const isSubstituting = $derived(gameStore.isSubstituting());
  const formationStatus = $derived(teamStore.getFormationStatus());
  const isPendingMode = $derived(fieldMode === 'pending');

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
      if (isPendingMode) {
        teamStore.assignPlayerToPendingPosition(selectedBenchPlayerId, positionName);
      } else {
        teamStore.assignPlayerToPosition(selectedBenchPlayerId, positionName);
      }
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

  function handleDropPlayer(playerId, positionName, replacedPlayerId) {
    if (isPendingMode) {
      teamStore.assignPlayerToPendingPosition(playerId, positionName);
      if (replacedPlayerId) {
        // If there's a player in the slot, move them to bench in pending
        const replacedPlayer = team?.getPlayer(replacedPlayerId);
        if (replacedPlayer) {
          replacedPlayer.clearPendingPosition();
        }
      }
    } else {
      if (replacedPlayerId) {
        // Swap players
        teamStore.substitutePlayers(replacedPlayerId, playerId);
      } else {
        // Just assign to position
        teamStore.assignPlayerToPosition(playerId, positionName);
      }
    }
  }

  function handleDropToBench(playerId) {
    if (!isPendingMode) {
      teamStore.movePlayerToBench(playerId);
    }
  }

  function handleFieldModeToggle() {
    const newMode = fieldMode === 'active' ? 'pending' : 'active';
    
    if (newMode === 'active' && fieldMode === 'pending') {
      // Apply pending positions
      teamStore.applyPendingPositions();
    } else if (newMode === 'pending') {
      // Copy current positions to pending
      team?.players.forEach(player => {
        if (player.isOnField()) {
          player.assignToPendingPosition(player.position);
        } else {
          player.clearPendingPosition();
        }
      });
    }
    
    gameStore.setFieldMode(newMode);
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
        <div class="flex gap-2">
          <button
            class={`px-4 py-2 rounded-lg font-medium transition-colors ${
              fieldMode === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onclick={handleFieldModeToggle}
            disabled={fieldMode === 'active'}
          >
            Active
          </button>
          <button
            class={`px-4 py-2 rounded-lg font-medium transition-colors ${
              fieldMode === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onclick={handleFieldModeToggle}
            disabled={fieldMode === 'pending'}
          >
            Pending
          </button>
        </div>
      </div>

      <FieldView
        {sport}
        {formation}
        {players}
        {displayFormat}
        {substitutingPlayerId}
        {isPendingMode}
        onPlayerClick={handleFieldPlayerClick}
        onDropPlayer={handleDropPlayer}
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
        onDropToBench={handleDropToBench}
      />
    </div>
  </div>
</div>
