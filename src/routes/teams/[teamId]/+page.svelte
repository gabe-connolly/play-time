<script>
  import { page } from '$app/state';
  import { Pencil, Trash2, Play, ChevronRight } from 'lucide-svelte';
  import PageHeader from '$lib/components/shared/PageHeader.svelte';
  import PlayerList from '$lib/components/setup/PlayerList.svelte';
  import Input from '$lib/components/shared/Input.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import * as appStore from '$lib/stores/appStore.svelte.js';
  import { href, go } from '$lib/utils/nav.js';
  import { formatGameDate, formatMinutes } from '$lib/utils/formatTime.js';

  const teamId = $derived(page.params.teamId);
  const team = $derived(appStore.getTeam(teamId));
  const games = $derived(appStore.getGamesForTeam(teamId));
  const liveGame = $derived(games.find(g => !g.isFinal) ?? null);
  const pastGames = $derived(games.filter(g => g.isFinal));

  let renaming = $state(false);
  let nameDraft = $state('');

  function startRename() {
    nameDraft = team.name;
    renaming = true;
  }

  function saveRename() {
    appStore.renameTeam(teamId, nameDraft);
    renaming = false;
  }

  function handleDeleteTeam() {
    if (confirm(`Delete ${team.name}, its roster, and all ${games.length} of its games? This cannot be undone.`)) {
      appStore.deleteTeam(teamId);
      go('/', { replaceState: true });
    }
  }

  function handleDeletePlayer(playerId) {
    const player = team.getPlayer(playerId);
    if (confirm(`Remove ${player.firstName} ${player.lastName} from the roster? Past game records keep their minutes.`)) {
      appStore.deletePlayer(teamId, playerId);
    }
  }

  function handleDeleteGame(game) {
    if (confirm(`Delete the game from ${formatGameDate(game.createdAt)}?`)) {
      appStore.deleteGame(game.id);
    }
  }
</script>

{#if !team}
  <PageHeader title="Team not found" backHref={href('/')} backLabel="Teams" />
{:else}
  <PageHeader title={team.name} backHref={href('/')} backLabel="Teams">
    {#snippet actions()}
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-950 hover:bg-black text-sm"
        onclick={startRename}
      >
        <Pencil size={16} /> Rename
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-sm"
        onclick={handleDeleteTeam}
      >
        <Trash2 size={16} /> Delete
      </button>
    {/snippet}
  </PageHeader>

  <main class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-5xl mx-auto grid gap-4 md:grid-cols-[3fr_2fr] items-start">
      <section class="bg-white rounded-lg shadow p-5">
        {#if renaming}
          <div class="flex gap-2 items-center mb-4">
            <div class="flex-1 [&>input]:w-full"><Input bind:value={nameDraft} placeholder="Team name" /></div>
            <Button onclick={saveRename} disabled={!nameDraft.trim()}>Save</Button>
            <Button variant="secondary" onclick={() => (renaming = false)}>Cancel</Button>
          </div>
        {/if}
        <PlayerList
          players={team.players}
          onAdd={data => appStore.addPlayer(teamId, data)}
          onUpdate={(playerId, data) => appStore.updatePlayer(teamId, playerId, data)}
          onDelete={handleDeletePlayer}
        />
      </section>

      <section class="space-y-4">
        <div class="bg-white rounded-lg shadow p-5">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">Game day</h2>
          {#if liveGame}
            <a
              href={href(`/games/${liveGame.id}`)}
              class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-orange-800 text-white font-semibold hover:bg-orange-900"
            >
              <Play size={18} /> Resume game in progress
            </a>
          {:else if team.players.length === 0}
            <p class="text-gray-700">Add players to the roster to start a game.</p>
          {:else}
            <a
              href={href(`/teams/${teamId}/new-game`)}
              class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900"
            >
              <Play size={18} /> New game
            </a>
          {/if}
        </div>

        <div class="bg-white rounded-lg shadow p-5">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">Past games ({pastGames.length})</h2>
          {#if pastGames.length === 0}
            <p class="text-gray-700">Finished games show up here with every player's minutes.</p>
          {:else}
            <ul class="space-y-2">
              {#each pastGames as game (game.id)}
                <li class="flex items-center gap-2">
                  <a
                    href={href(`/games/${game.id}/summary`)}
                    class="flex-1 flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100"
                  >
                    <div>
                      <div class="font-medium text-gray-900">{formatGameDate(game.createdAt)}</div>
                      <div class="text-sm text-gray-700">
                        {formatMinutes(game.config.totalMinutes)} · {game.participants.length} players ·
                        {game.config.size === 'custom' ? 'Custom' : `${game.config.size}v${game.config.size}`}
                      </div>
                    </div>
                    <ChevronRight size={18} class="text-gray-700" />
                  </a>
                  <button
                    class="p-2 rounded text-red-800 hover:bg-red-50"
                    title="Delete game"
                    aria-label="Delete game"
                    onclick={() => handleDeleteGame(game)}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </section>
    </div>
  </main>
{/if}
