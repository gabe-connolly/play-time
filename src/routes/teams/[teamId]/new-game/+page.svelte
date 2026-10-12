<script>
  import { page } from '$app/state';
  import { Minus, Plus } from 'lucide-svelte';
  import PageHeader from '$lib/components/shared/PageHeader.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import * as appStore from '$lib/stores/appStore.svelte.js';
  import { SOCCER, PERIOD_OPTIONS, MAX_CUSTOM_POSITION_COUNT, periodLabel } from '$lib/config/sports.js';
  import { formatPlayTime } from '$lib/utils/formatTime.js';
  import { getDisplayName } from '$lib/utils/displayName.js';
  import { href, go } from '$lib/utils/nav.js';

  const teamId = page.params.teamId;
  const team = appStore.getTeam(teamId);
  const last = appStore.getLastGameConfig(teamId);

  const defaultCustom = Object.fromEntries(SOCCER.positions.map(p => [p.name, p.name === 'Goalkeeper' ? 1 : 2]));

  let totalMinutes = $state(last?.totalMinutes ?? 50);
  let periodCount = $state(last?.periodCount ?? 2);
  let size = $state(last?.size ?? 7);
  let formationName = $state(last?.formationName ?? SOCCER.getFormationsForTeamSize(7)[0].name);
  let customCounts = $state(last?.size === 'custom' ? { ...last.positionCounts } : { ...defaultCustom });
  let available = $state(new Set(team?.players.map(p => p.id) ?? []));

  const formations = $derived(size === 'custom' ? [] : SOCCER.getFormationsForTeamSize(size));
  const formation = $derived(formations.find(f => f.name === formationName) ?? formations[0] ?? null);
  const positionCounts = $derived(size === 'custom' ? customCounts : (formation?.positions ?? {}));
  const fieldCount = $derived(Object.values(positionCounts).reduce((a, b) => a + b, 0));
  const minutesValid = $derived(Number.isInteger(totalMinutes) && totalMinutes >= 1 && totalMinutes <= 240);
  const periodLengthMs = $derived(minutesValid ? (totalMinutes * 60000) / periodCount : 0);

  const problems = $derived.by(() => {
    const list = [];
    if (!minutesValid) list.push('Game length must be between 1 and 240 minutes.');
    if (fieldCount < 1) list.push('Put at least one position on the field.');
    if (available.size < 1) list.push('Pick at least one available player.');
    return list;
  });

  function selectSize(next) {
    size = next;
    if (next !== 'custom') formationName = SOCCER.getFormationsForTeamSize(next)[0].name;
  }

  function adjustCustom(position, delta) {
    const max = position === 'Goalkeeper' ? 1 : MAX_CUSTOM_POSITION_COUNT;
    customCounts[position] = Math.min(max, Math.max(0, (customCounts[position] ?? 0) + delta));
  }

  function toggleAvailable(playerId) {
    const next = new Set(available);
    if (next.has(playerId)) next.delete(playerId);
    else next.add(playerId);
    available = next;
  }

  function setAll(on) {
    available = new Set(on ? team.players.map(p => p.id) : []);
  }

  function handleStart() {
    if (problems.length) return;
    const gameId = appStore.createGame(
      teamId,
      {
        totalMinutes,
        periodCount,
        size,
        formationName: size === 'custom' ? null : formation.name,
        positionCounts: { ...positionCounts }
      },
      [...available]
    );
    go(`/games/${gameId}`, { replaceState: true });
  }

  const segment = active =>
    `px-4 py-2 rounded-lg font-medium ${active ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`;
</script>

{#if !team}
  <PageHeader title="Team not found" backHref={href('/')} backLabel="Teams" />
{:else}
  <PageHeader title="New game · {team.name}" backHref={href(`/teams/${teamId}`)} backLabel="Team" />

  <main class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-5xl mx-auto grid gap-4 md:grid-cols-2 items-start">
      <section class="bg-white rounded-lg shadow p-5 space-y-6">
        <div>
          <label for="total-minutes" class="block text-lg font-semibold text-gray-900 mb-2">Game length</label>
          <div class="flex items-center gap-3">
            <input
              id="total-minutes"
              type="number"
              inputmode="numeric"
              min="1"
              max="240"
              bind:value={totalMinutes}
              class="w-24 px-3 py-2 border border-gray-500 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-800">minutes total</span>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Periods</h2>
          <div class="flex gap-2 flex-wrap">
            {#each PERIOD_OPTIONS as option (option.count)}
              <button class={segment(periodCount === option.count)} onclick={() => (periodCount = option.count)}>
                {option.label}
              </button>
            {/each}
          </div>
          {#if periodLengthMs > 0}
            <p class="text-sm text-gray-700 mt-2">
              {periodCount} × {formatPlayTime(periodLengthMs)} ({periodLabel(0, periodCount)} through {periodLabel(periodCount - 1, periodCount)})
            </p>
          {/if}
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Players on the field</h2>
          <div class="flex gap-2 flex-wrap">
            {#each SOCCER.getAvailableTeamSizes() as n (n)}
              <button class={segment(size === n)} onclick={() => selectSize(n)}>{n}v{n}</button>
            {/each}
            <button class={segment(size === 'custom')} onclick={() => selectSize('custom')}>Custom</button>
          </div>
        </div>

        {#if size === 'custom'}
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Custom lineup ({fieldCount} on the field)</h2>
            <div class="space-y-2">
              {#each SOCCER.positions as pos (pos.name)}
                <div class="flex items-center gap-3">
                  <span class="w-28 font-medium text-gray-900">{pos.name}</span>
                  <button
                    class="p-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                    aria-label="Fewer {pos.name}s"
                    onclick={() => adjustCustom(pos.name, -1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span class="w-6 text-center text-lg font-semibold tabular-nums text-gray-900">{customCounts[pos.name] ?? 0}</span>
                  <button
                    class="p-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                    aria-label="More {pos.name}s"
                    onclick={() => adjustCustom(pos.name, 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Formation</h2>
            <div class="flex gap-2 flex-wrap">
              {#each formations as f (f.name)}
                <button class={segment(formation?.name === f.name)} onclick={() => (formationName = f.name)}>
                  {f.name}
                </button>
              {/each}
            </div>
            <p class="text-sm text-gray-700 mt-2">Goalkeeper plus defenders–midfielders–forwards.</p>
          </div>
        {/if}
      </section>

      <section class="bg-white rounded-lg shadow p-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-900">
            Available today ({available.size} of {team.players.length})
          </h2>
          <div class="flex gap-2">
            <button class="text-sm px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300" onclick={() => setAll(true)}>All</button>
            <button class="text-sm px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300" onclick={() => setAll(false)}>None</button>
          </div>
        </div>
        <ul class="space-y-1 mb-5">
          {#each team.players as player (player.id)}
            <li>
              <label class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  class="w-5 h-5 accent-green-800"
                  checked={available.has(player.id)}
                  onchange={() => toggleAvailable(player.id)}
                />
                <span class="flex-1 text-gray-900">{getDisplayName(player)}</span>
                {#if player.jerseyNumber}
                  <span class="text-gray-700">#{player.jerseyNumber}</span>
                {/if}
              </label>
            </li>
          {/each}
        </ul>

        {#if problems.length}
          <ul class="mb-3 text-sm text-red-800 space-y-1" role="alert">
            {#each problems as problem (problem)}
              <li>{problem}</li>
            {/each}
          </ul>
        {:else if available.size < fieldCount}
          <p class="mb-3 text-sm text-gray-800">
            Heads up: {fieldCount} positions but only {available.size} players, so some slots will stay empty.
          </p>
        {/if}

        <Button variant="success" onclick={handleStart} disabled={problems.length > 0}>
          <span class="text-lg">Start game →</span>
        </Button>
      </section>
    </div>
  </main>
{/if}
