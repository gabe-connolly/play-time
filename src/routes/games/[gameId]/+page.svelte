<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { ChevronLeft, Flag } from 'lucide-svelte';
  import { KeepAwake } from '@capacitor-community/keep-awake';
  import FieldView from '$lib/components/game/FieldView.svelte';
  import BenchView from '$lib/components/game/BenchView.svelte';
  import RosterView from '$lib/components/game/RosterView.svelte';
  import SubstitutionPanel from '$lib/components/game/SubstitutionPanel.svelte';
  import { SOCCER, periodLabel } from '$lib/config/sports.js';
  import { formatPlayTime, formatCountdown } from '$lib/utils/formatTime.js';
  import { href, go } from '$lib/utils/nav.js';
  import * as appStore from '$lib/stores/appStore.svelte.js';
  import * as gameStore from '$lib/stores/gameStore.svelte.js';

  const sport = SOCCER;
  const gameId = page.params.gameId;

  // Wall time, refreshed several times a second; every displayed time derives from it.
  let now = $state(Date.now());

  const game = $derived(appStore.getGame(gameId));
  const team = $derived(game ? appStore.getTeam(game.teamId) : null);
  const formation = $derived(game?.formation);
  const players = $derived(game?.participants ?? []);
  const clock = $derived(game?.clock);
  const clockMs = $derived(game ? game.clockMs(now) : 0);
  const remainingMs = $derived(clock ? clock.remainingMs(now) : 0);
  const clockRunning = $derived(clock?.isRunning ?? false);
  const periodOver = $derived(clock?.isPeriodOver ?? false);
  const currentPeriodLabel = $derived(clock ? periodLabel(clock.periodIndex, clock.periodCount) : '');
  const nextPeriodLabel = $derived(
    clock && !clock.isLastPeriod ? periodLabel(clock.periodIndex + 1, clock.periodCount) : null
  );
  const absentPlayers = $derived(
    team ? team.players.filter(p => !game.getParticipant(p.id)) : []
  );

  const displayFormat = $derived(appStore.getSettings().displayFormat);
  const substitutingPlayerId = $derived(gameStore.getSubstitutingPlayer());
  const selectedBenchPlayerId = $derived(gameStore.getSelectedBenchPlayer());
  const fieldMode = $derived(gameStore.getFieldMode());
  const playerListView = $derived(gameStore.getPlayerListView());
  const isSubstituting = $derived(gameStore.isSubstituting());
  const isPendingMode = $derived(fieldMode === 'pending');
  const formationStatus = $derived(game ? game.getFormationStatus(isPendingMode) : {});
  const hasPendingWork = $derived(players.some(p => p.pendingPosition !== null));
  const substitutingPlayer = $derived(substitutingPlayerId ? game?.getParticipant(substitutingPlayerId) : null);

  // Side countdown timer
  const timerRunning = $derived(gameStore.getTimerRunning());
  const timerDurationMs = $derived.by(() => (void now, gameStore.getTimerDurationMs()));
  const timerRemainingMs = $derived.by(() => (void now, gameStore.getTimerRemainingMs()));
  const timerExpired = $derived.by(() => (void now, gameStore.isTimerExpired()));

  function update(mutate) {
    appStore.mutateGame(gameId, mutate);
  }

  onMount(() => {
    gameStore.resetGameUi();
    if (game?.isFinal) {
      go(`/games/${gameId}/summary`, { replaceState: true });
      return;
    }
    KeepAwake.keepAwake().catch(() => {});

    const interval = setInterval(() => {
      now = Date.now();
      const g = appStore.getGame(gameId);
      if (g && g.clock.isRunning && g.clock.remainingMs(now) <= 0) {
        update((copy, at) => copy.tick(at));
      }
      if (gameStore.getTimerRunning() && gameStore.isTimerExpired()) {
        gameStore.stopTimer();
      }
    }, 250);

    // A clock that ran out while the app was closed closes its period on open.
    update((copy, at) => copy.tick(at));

    return () => {
      clearInterval(interval);
      KeepAwake.allowSleep().catch(() => {});
    };
  });

  // --- Clock ---

  function handleToggleClock() {
    update((copy, at) => (copy.clock.isRunning ? copy.pauseClock(at) : copy.startClock(at)));
  }

  function handleStartNextPeriod() {
    update((copy, at) => copy.nextPeriod() && copy.startClock(at));
  }

  function handleEndPeriod() {
    if (confirm(`End the ${currentPeriodLabel} now?`)) {
      update((copy, at) => copy.endPeriod(at));
    }
  }

  function handleEndGame() {
    const early = !(periodOver && !nextPeriodLabel);
    if (!early || confirm('End the game now? Minutes are final after this.')) {
      update((copy, at) => copy.end(at));
      go(`/games/${gameId}/summary`, { replaceState: true });
    }
  }

  // --- Lineup ---

  function handleFieldPlayerClick(playerId) {
    if (substitutingPlayerId === playerId) gameStore.cancelSubstitution();
    else gameStore.startSubstitution(playerId);
  }

  function handleAssignPosition(positionName) {
    const playerId = selectedBenchPlayerId;
    if (!playerId) return;
    const indexKey = isPendingMode ? 'pendingPositionIndex' : 'positionIndex';
    const inPosition = players.filter(p =>
      isPendingMode ? p.pendingPosition === positionName : p.isOnField() && p.position === positionName
    );
    const totalSlots = formation.getPositionCount(positionName);

    let slotIndex = -1;
    for (let i = 0; i < totalSlots; i++) {
      if (!inPosition.find(p => p[indexKey] === i)) {
        slotIndex = i;
        break;
      }
    }

    update((copy, at) => {
      if (slotIndex === -1) {
        // Position is full: displace whoever holds slot 0.
        const displaced = inPosition.find(p => p[indexKey] === 0);
        if (displaced) {
          if (isPendingMode) copy.clearPendingPosition(displaced.id);
          else copy.moveToBench(displaced.id, at);
        }
        slotIndex = 0;
      }
      if (isPendingMode) copy.assignToPendingPosition(playerId, positionName, slotIndex);
      else copy.assignToPosition(playerId, positionName, slotIndex, at);
    });
    gameStore.selectBenchPlayer(null);
  }

  function handleMoveToBench() {
    if (!substitutingPlayerId) return;
    const id = substitutingPlayerId;
    update((copy, at) => (isPendingMode ? copy.clearPendingPosition(id) : copy.moveToBench(id, at)));
    gameStore.cancelSubstitution();
  }

  function handleCompleteSubstitution() {
    if (!substitutingPlayerId || !selectedBenchPlayerId) return;
    const [outId, inId] = [substitutingPlayerId, selectedBenchPlayerId];
    update((copy, at) => {
      if (isPendingMode) {
        const out = copy.getParticipant(outId);
        if (!out || out.pendingPosition === null) return false;
        copy.assignToPendingPosition(inId, out.pendingPosition, out.pendingPositionIndex);
        copy.clearPendingPosition(outId);
      } else {
        copy.substitute(outId, inId, null, at);
      }
    });
    gameStore.cancelSubstitution();
  }

  function handleDropPlayer(playerId, positionName, slotIndex, replacedPlayerId) {
    if (substitutingPlayerId && [playerId, replacedPlayerId].includes(substitutingPlayerId)) {
      gameStore.cancelSubstitution();
    }
    update((copy, at) => {
      const dragged = copy.getParticipant(playerId);
      if (!dragged || dragged.isOut()) return false;
      if (isPendingMode) {
        if (replacedPlayerId && replacedPlayerId !== playerId) {
          const [oldPos, oldIdx] = [dragged.pendingPosition, dragged.pendingPositionIndex];
          copy.assignToPendingPosition(playerId, positionName, slotIndex);
          if (oldPos) copy.assignToPendingPosition(replacedPlayerId, oldPos, oldIdx);
          else copy.clearPendingPosition(replacedPlayerId);
        } else {
          copy.assignToPendingPosition(playerId, positionName, slotIndex);
        }
      } else if (replacedPlayerId && replacedPlayerId !== playerId) {
        if (dragged.isOnField()) {
          copy.swapFieldPlayers(playerId, replacedPlayerId, at);
        } else {
          copy.substitute(replacedPlayerId, playerId, slotIndex, at);
        }
      } else {
        copy.assignToPosition(playerId, positionName, slotIndex, at);
      }
    });
  }

  function handleDropToBench(playerId) {
    if (isPendingMode) return;
    if (substitutingPlayerId === playerId) gameStore.cancelSubstitution();
    update((copy, at) => copy.moveToBench(playerId, at));
  }

  function handleToggleAvailability(playerId, available) {
    if (substitutingPlayerId === playerId) gameStore.cancelSubstitution();
    update((copy, at) => copy.setAvailability(playerId, available, at));
  }

  function handleAddLatePlayer(playerId) {
    const player = team?.getPlayer(playerId);
    if (player) update(copy => copy.addParticipant(player));
  }

  // --- Pending lineup ---

  function handlePrepareSubs() {
    if (!hasPendingWork) update(copy => copy.initializePendingFromActive());
    gameStore.setFieldMode('pending');
  }

  function handleCommitSubstitution() {
    update((copy, at) => copy.commitPending(at));
    gameStore.setFieldMode('active');
  }

  function handleCancelPending() {
    update(copy => copy.clearPendingPositions());
    gameStore.setFieldMode('active');
  }

  // --- Side timer ---

  function handleToggleTimer() {
    if (timerRunning) gameStore.stopTimer();
    else gameStore.startTimer();
  }
</script>

{#if !game}
  <div class="min-h-screen bg-gray-100 p-8 text-center">
    <p class="text-lg text-gray-900 mb-4">This game no longer exists.</p>
    <a class="text-blue-800 underline" href={href('/')}>Back to teams</a>
  </div>
{:else}
  <div class="h-dvh bg-gray-100 p-3 flex flex-col">
    <div class="max-w-[1400px] w-full mx-auto flex-1 min-h-0 flex flex-col">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow mb-3 px-3 py-2 flex items-center gap-3 flex-wrap shrink-0">
        <a
          href={href(`/teams/${game.teamId}`)}
          class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm shrink-0"
        >
          <ChevronLeft size={16} /> {team?.name ?? 'Team'}
        </a>

        <div class="flex-1 flex items-center justify-end gap-3 flex-wrap">
          <!-- Period clock -->
          <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span class="text-xs font-semibold text-gray-800 uppercase tracking-wide">{currentPeriodLabel}</span>
            <span
              class={`text-2xl font-mono tabular-nums font-bold ${periodOver ? 'text-red-800' : 'text-gray-900'}`}
              aria-live="polite"
            >
              {formatCountdown(remainingMs)}
            </span>
            {#if !periodOver}
              <button
                class={`px-3 py-1 rounded font-semibold text-sm transition-colors ${
                  clockRunning ? 'bg-red-800 text-white hover:bg-red-900' : 'bg-green-800 text-white hover:bg-green-900'
                }`}
                onclick={handleToggleClock}
              >
                {clockRunning ? 'Pause' : clock.periodElapsedMs(now) > 0 ? 'Resume' : 'Start'}
              </button>
              <button
                class="px-2.5 py-1 rounded font-medium text-xs bg-gray-200 text-gray-800 hover:bg-gray-300"
                onclick={handleEndPeriod}
              >
                End {currentPeriodLabel}
              </button>
            {:else if nextPeriodLabel}
              <button
                class="px-3 py-1 rounded font-semibold text-sm bg-green-800 text-white hover:bg-green-900"
                onclick={handleStartNextPeriod}
              >
                Start {nextPeriodLabel}
              </button>
            {:else}
              <button
                class="flex items-center gap-1.5 px-3 py-1 rounded font-semibold text-sm bg-blue-800 text-white hover:bg-blue-900"
                onclick={handleEndGame}
              >
                <Flag size={14} /> Final whistle
              </button>
            {/if}
          </div>

          <!-- Side countdown timer -->
          <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span class="text-xs font-medium text-gray-700 uppercase tracking-wide">Timer</span>
            <span class={`text-lg font-mono tabular-nums font-bold ${timerExpired ? 'text-red-800' : 'text-gray-800'}`}>
              {formatPlayTime(timerRemainingMs)}
            </span>
            {#if timerDurationMs > 0}
              <button
                class={`px-2.5 py-0.5 rounded font-semibold text-xs transition-colors ${
                  timerRunning
                    ? 'bg-red-800 text-white hover:bg-red-900'
                    : timerExpired
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                      : 'bg-green-800 text-white hover:bg-green-900'
                }`}
                onclick={handleToggleTimer}
                disabled={timerExpired && !timerRunning}
              >
                {timerRunning ? 'Stop' : timerRemainingMs > 0 ? 'Resume' : 'Done'}
              </button>
              <button
                class="px-2.5 py-0.5 rounded font-medium text-xs bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                onclick={gameStore.resetTimer}
              >
                Reset
              </button>
            {/if}
            {#each [5, 10, 15] as mins (mins)}
              <button
                class="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                onclick={() => gameStore.startTimer(mins * 60 * 1000)}
              >
                {mins}m
              </button>
            {/each}
            {#if timerExpired}
              <span class="text-xs text-red-800 font-semibold">Time!</span>
            {/if}
          </div>
        </div>
      </div>

      <!-- Main two-column layout -->
      <div class="flex-1 min-h-0 flex gap-3">
        <div class="flex-1 min-w-0 flex flex-col">
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
            onViewActive={() => gameStore.setFieldMode('active')}
            onViewPending={() => gameStore.setFieldMode('pending')}
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

          <div class="text-center pt-2 shrink-0">
            <button class="text-sm text-gray-800 underline hover:text-gray-900" onclick={handleEndGame}>
              End game early
            </button>
          </div>
        </div>

        <div class="w-80 shrink-0 flex flex-col gap-3">
          <div class="bg-white rounded-lg shadow-lg p-4 flex-1 min-h-0 overflow-y-auto">
            <div class="flex gap-2 mb-3">
              <button
                class={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  playerListView === 'bench' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onclick={() => gameStore.setPlayerListView('bench')}
              >
                Bench
              </button>
              <button
                class={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  playerListView === 'roster' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
                {clockMs}
                onSelectPlayer={id => gameStore.selectBenchPlayer(id)}
                onAssignPosition={handleAssignPosition}
                onDropToBench={handleDropToBench}
              />
            {:else}
              <RosterView
                {players}
                {displayFormat}
                showPlayTime={true}
                {clockMs}
                {absentPlayers}
                onDropToBench={handleDropToBench}
                onToggleAvailability={handleToggleAvailability}
                onAddLatePlayer={handleAddLatePlayer}
              />
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
