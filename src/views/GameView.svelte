<script>
  import { onMount } from 'svelte';
  import { ChevronLeft } from 'lucide-svelte';
  import FieldView from '$lib/components/game/FieldView.svelte';
  import BenchView from '$lib/components/game/BenchView.svelte';
  import RosterView from '$lib/components/game/RosterView.svelte';
  import SubstitutionPanel from '$lib/components/game/SubstitutionPanel.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import { formatPlayTime } from '$lib/utils/formatTime.js';
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
  const playerListView = $derived(gameStore.getPlayerListView());

  const isSubstituting = $derived(gameStore.isSubstituting());
  const isPendingMode = $derived(fieldMode === 'pending');
  const formationStatus = $derived(teamStore.getFormationStatus(isPendingMode));
  const clockRunning = $derived(gameStore.getClockRunning());
  const hasPendingWork = $derived(players.some(p => p.pendingPosition !== null));
  const gameClockMs = $derived.by(() => {
    void playTimeTick;
    return gameStore.getGameClockMs();
  });

  // Countdown timer
  const timerRunning = $derived(gameStore.getTimerRunning());
  const timerDurationMs = $derived(gameStore.getTimerDurationMs());
  const timerRemainingMs = $derived.by(() => {
    void playTimeTick;
    return gameStore.getTimerRemainingMs();
  });
  const timerExpired = $derived.by(() => {
    void playTimeTick;
    return gameStore.isTimerExpired();
  });

  const substitutingPlayer = $derived(
    substitutingPlayerId ? team?.getPlayer(substitutingPlayerId) : null
  );

  // Play time ticker - increments every second to force timer re-renders
  let playTimeTick = $state(0);
  let tickInterval = null;

  onMount(() => {
    tickInterval = setInterval(() => {
      playTimeTick++;
      // Auto-stop countdown timer when expired
      if (gameStore.getTimerRunning() && gameStore.isTimerExpired()) {
        gameStore.stopTimer();
      }
    }, 1000);
    return () => clearInterval(tickInterval);
  });

  function handleFieldPlayerClick(playerId) {
    if (substitutingPlayerId === playerId) {
      gameStore.cancelSubstitution();
    } else {
      gameStore.startSubstitution(playerId);
    }
  }

  function handleBenchPlayerSelect(playerId) {
    gameStore.selectBenchPlayer(playerId);
  }

  function handleAssignPosition(positionName) {
    if (selectedBenchPlayerId) {
      const indexKey = isPendingMode ? 'pendingPositionIndex' : 'positionIndex';
      const posKey = isPendingMode ? 'pendingPosition' : 'position';
      const playersInPosition = players.filter(p => p[posKey] === positionName);
      const formationObj = teamStore.getFormation();
      const totalSlots = formationObj.getPositionCount(positionName);

      // Find first empty slot
      let slotIndex = -1;
      for (let i = 0; i < totalSlots; i++) {
        if (!playersInPosition.find(p => p[indexKey] === i)) {
          slotIndex = i;
          break;
        }
      }

      if (slotIndex === -1) {
        // Position is full — displace the player in slot 0
        const displaced = playersInPosition.find(p => p[indexKey] === 0);
        if (displaced) {
          if (isPendingMode) {
            teamStore.clearPlayerPendingPosition(displaced.id);
          } else {
            teamStore.movePlayerToBench(displaced.id);
          }
        }
        slotIndex = 0;
      }

      if (isPendingMode) {
        teamStore.assignPlayerToPendingPosition(selectedBenchPlayerId, positionName, slotIndex);
      } else {
        teamStore.assignPlayerToPosition(selectedBenchPlayerId, positionName, slotIndex);
      }
      gameStore.selectBenchPlayer(null);
    }
  }

  function handleMoveToBench() {
    if (substitutingPlayerId) {
      if (isPendingMode) {
        teamStore.clearPlayerPendingPosition(substitutingPlayerId);
      } else {
        teamStore.movePlayerToBench(substitutingPlayerId);
      }
      gameStore.cancelSubstitution();
    }
  }

  function handleCompleteSubstitution() {
    if (substitutingPlayerId && selectedBenchPlayerId) {
      const onFieldPlayer = team?.getPlayer(substitutingPlayerId);
      const slotIndex = onFieldPlayer?.positionIndex;
      teamStore.substitutePlayers(substitutingPlayerId, selectedBenchPlayerId, slotIndex);
      gameStore.cancelSubstitution();
    }
  }

  function handleDropPlayer(playerId, positionName, slotIndex, replacedPlayerId, sourcePosition, sourceSlotIndex) {
    if (isPendingMode) {
      if (replacedPlayerId && replacedPlayerId !== playerId) {
        const draggedPlayer = team?.getPlayer(playerId);

        if (draggedPlayer) {
          // Save dragged player's old pending position before overwriting
          const draggedOldPosition = draggedPlayer.pendingPosition;
          const draggedOldSlotIndex = draggedPlayer.pendingPositionIndex;

          // Put dragged player into the target slot
          teamStore.assignPlayerToPendingPosition(playerId, positionName, slotIndex);

          // Move replaced player to dragged player's old position, or clear if dragged had none
          if (draggedOldPosition) {
            teamStore.assignPlayerToPendingPosition(replacedPlayerId, draggedOldPosition, draggedOldSlotIndex);
          } else {
            teamStore.clearPlayerPendingPosition(replacedPlayerId);
          }
        }
      } else {
        teamStore.assignPlayerToPendingPosition(playerId, positionName, slotIndex);
      }
    } else {
      const draggedPlayer = team?.getPlayer(playerId);

      if (replacedPlayerId && replacedPlayerId !== playerId) {
        teamStore.swapFieldPlayers(playerId, replacedPlayerId);
      } else if (draggedPlayer?.isOnBench()) {
        teamStore.assignPlayerToPosition(playerId, positionName, slotIndex);
      } else if (draggedPlayer?.isOnField()) {
        teamStore.assignPlayerToPosition(playerId, positionName, slotIndex);
      }
    }
  }

  function handleDropToBench(playerId) {
    if (!isPendingMode) {
      teamStore.movePlayerToBench(playerId);
    }
  }

  function handlePrepareSubs() {
    if (!hasPendingWork) {
      teamStore.initializePendingFromActive();
    }
    gameStore.setFieldMode('pending');
  }

  function handleCommitSubstitution() {
    teamStore.commitSubstitution();
    gameStore.setFieldMode('active');
  }

  function handleCancelPending() {
    teamStore.clearPendingPositions();
    gameStore.setFieldMode('active');
  }

  function handleViewActive() {
    gameStore.setFieldMode('active');
  }

  function handleViewPending() {
    gameStore.setFieldMode('pending');
  }

  function handleToggleClock() {
    if (clockRunning) {
      teamStore.stopClock();
      gameStore.setClockRunning(false);
    } else {
      teamStore.startClock();
      gameStore.setClockRunning(true);
    }
  }

  function handleResetClock() {
    if (confirm('Reset the game clock and all player play times to zero?')) {
      teamStore.stopClock();
      gameStore.resetGameClock();
      teamStore.resetPlayTime();
    }
  }

  function handleStartTimerPreset(minutes) {
    gameStore.startTimer(minutes * 60 * 1000);
  }

  function handleToggleTimer() {
    if (timerRunning) {
      gameStore.stopTimer();
    } else {
      gameStore.startTimer();
    }
  }

  function handleClearData() {
    if (confirm('Clear all data? This will reset the app completely.')) {
      teamStore.resetAllData();
      gameStore.resetGameState();
    }
  }
</script>

<div class="min-h-screen bg-gray-100 p-4">
  <div class="max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow mb-4 px-3 py-2 flex items-center gap-4">
      <!-- Setup button -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm shrink-0"
        onclick={gameStore.goToSetup}
      >
        <ChevronLeft size={16} /> Setup
      </button>

      <!-- Timers -->
      <div class="flex-1 flex items-center justify-end gap-3">
        <!-- Game Clock -->
        <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Clock</span>
          <span class="text-lg font-mono tabular-nums font-bold text-gray-800">
            {formatPlayTime(gameClockMs)}
          </span>
          <button
            class={`px-2.5 py-0.5 rounded font-semibold text-xs transition-colors ${
              clockRunning
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            onclick={handleToggleClock}
          >
            {clockRunning ? 'Stop' : gameClockMs > 0 ? 'Resume' : 'Start'}
          </button>
          <button
            class="px-2.5 py-0.5 rounded font-medium text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            onclick={handleResetClock}
            disabled={clockRunning}
          >
            Reset
          </button>
        </div>

        <!-- Countdown Timer -->
        <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Timer</span>
          <span class={`text-lg font-mono tabular-nums font-bold ${timerExpired ? 'text-red-600' : 'text-gray-800'}`}>
            {formatPlayTime(timerRemainingMs)}
          </span>
          {#if timerDurationMs > 0}
            <button
              class={`px-2.5 py-0.5 rounded font-semibold text-xs transition-colors ${
                timerRunning
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : timerExpired
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              onclick={handleToggleTimer}
              disabled={timerExpired && !timerRunning}
            >
              {timerRunning ? 'Stop' : timerRemainingMs > 0 ? 'Resume' : 'Done'}
            </button>
            <button
              class="px-2.5 py-0.5 rounded font-medium text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              onclick={gameStore.resetTimer}
            >
              Reset
            </button>
          {/if}
          {#each [5, 10, 15] as mins}
            <button
              class="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              onclick={() => handleStartTimerPreset(mins)}
            >
              {mins}m
            </button>
          {/each}
          {#if timerExpired}
            <span class="text-xs text-red-600 font-semibold">Time!</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Main two-column layout -->
    <div class="flex gap-4">
      <!-- Left: Field -->
      <div class="flex-1 min-w-0">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <FieldView
            {sport}
            {formation}
            {players}
            {displayFormat}
            {substitutingPlayerId}
            {isPendingMode}
            {hasPendingWork}
            onPlayerClick={handleFieldPlayerClick}
            onDropPlayer={handleDropPlayer}
            onViewActive={handleViewActive}
            onViewPending={handleViewPending}
            onPrepareSubs={handlePrepareSubs}
            onCommitSubs={handleCommitSubstitution}
            onDiscardSubs={handleCancelPending}
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
        </div>

        <div class="text-center py-4">
          <button
            class="text-sm text-red-400 hover:text-red-600 underline"
            onclick={handleClearData}
          >
            Clear All Data
          </button>
        </div>
      </div>

      <!-- Right: Sidebar -->
      <div class="w-80 shrink-0 flex flex-col gap-4">
        <!-- Bench/Roster toggle and list -->
        <div class="bg-white rounded-lg shadow-lg p-4 flex-1 min-h-0 overflow-y-auto">
          <div class="flex gap-2 mb-3">
            <button
              class={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                playerListView === 'bench'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onclick={() => gameStore.setPlayerListView('bench')}
            >
              Bench
            </button>
            <button
              class={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                playerListView === 'roster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onclick={() => gameStore.setPlayerListView('roster')}
            >
              Team
            </button>
          </div>

          {#if playerListView === 'bench'}
            <BenchView
              {players}
              {sport}
              {formationStatus}
              {displayFormat}
              selectedPlayerId={selectedBenchPlayerId}
              {isSubstituting}
              showPlayTime={true}
              {playTimeTick}
              onSelectPlayer={handleBenchPlayerSelect}
              onAssignPosition={handleAssignPosition}
              onDropToBench={handleDropToBench}
            />
          {:else}
            <RosterView
              {players}
              {displayFormat}
              {fieldMode}
              showPlayTime={true}
              {playTimeTick}
              onDropToBench={handleDropToBench}
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
