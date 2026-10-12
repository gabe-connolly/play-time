<script>
  import { page } from '$app/state';
  import PageHeader from '$lib/components/shared/PageHeader.svelte';
  import * as appStore from '$lib/stores/appStore.svelte.js';
  import { periodLabel } from '$lib/config/sports.js';
  import { formatPlayTime, formatGameDate } from '$lib/utils/formatTime.js';
  import { getDisplayName } from '$lib/utils/displayName.js';
  import { href } from '$lib/utils/nav.js';

  const gameId = page.params.gameId;
  const game = $derived(appStore.getGame(gameId));
  const team = $derived(game ? appStore.getTeam(game.teamId) : null);
  const displayFormat = $derived(appStore.getSettings().displayFormat);

  const now = Date.now();
  const rows = $derived(
    game
      ? game
          .getPlaytimeSummary(now)
          .sort((a, b) => b.totalMs - a.totalMs || a.participant.lastName.localeCompare(b.participant.lastName))
      : []
  );
  const periods = $derived(game ? game.clock.periods : []);
  const gameMs = $derived(game ? game.clockMs(now) : 0);
  const maxMs = $derived(Math.max(1, ...rows.map(r => r.totalMs)));
</script>

{#if !game}
  <PageHeader title="Game not found" backHref={href('/')} backLabel="Teams" />
{:else}
  <PageHeader
    title="{team?.name ?? 'Game'} · {formatGameDate(game.createdAt)}"
    backHref={href(`/teams/${game.teamId}`)}
    backLabel="Team"
  />

  <main class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-5xl mx-auto bg-white rounded-lg shadow p-5">
      <div class="flex items-baseline justify-between flex-wrap gap-2 mb-4">
        <h2 class="text-2xl font-bold text-gray-900">Playing time</h2>
        <p class="text-gray-800">
          {game.isFinal ? 'Final' : 'In progress'} · {formatPlayTime(gameMs)} played of {game.config.totalMinutes}:00 ·
          {game.config.size === 'custom' ? 'Custom lineup' : `${game.config.size}v${game.config.size} ${game.config.formationName}`}
        </p>
      </div>

      {#if !game.isFinal}
        <a
          href={href(`/games/${game.id}`)}
          class="inline-block mb-4 px-4 py-2 rounded-lg bg-orange-800 text-white font-semibold hover:bg-orange-900"
        >
          Back to the game
        </a>
      {/if}

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b-2 border-gray-300 text-sm text-gray-800">
              <th class="py-2 pr-3 font-semibold">Player</th>
              {#each periods as _, i (i)}
                <th class="py-2 px-3 font-semibold text-right">{periodLabel(i, game.clock.periodCount)}</th>
              {/each}
              <th class="py-2 px-3 font-semibold text-right">Total</th>
              <th class="py-2 pl-3 w-1/4"><span class="sr-only">Share of game</span></th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row (row.id)}
              <tr class="border-b border-gray-200">
                <td class="py-2 pr-3 text-gray-900">
                  {getDisplayName(row.participant, displayFormat)}
                  {#if row.participant.jerseyNumber}<span class="text-gray-700 ml-1">#{row.participant.jerseyNumber}</span>{/if}
                  {#if row.participant.isOut()}<span class="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-800 text-white">Out</span>{/if}
                </td>
                {#each row.periodMs as ms, i (i)}
                  <td class="py-2 px-3 text-right font-mono tabular-nums text-gray-900">{formatPlayTime(ms)}</td>
                {/each}
                <td class="py-2 px-3 text-right font-mono tabular-nums font-bold text-gray-900">{formatPlayTime(row.totalMs)}</td>
                <td class="py-2 pl-3">
                  <div class="h-3 rounded bg-gray-200" aria-hidden="true">
                    <div class="h-3 rounded bg-green-800" style="width: {(row.totalMs / maxMs) * 100}%"></div>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </main>
{/if}
