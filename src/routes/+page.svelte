<script>
  import { Plus, Settings, ChevronRight } from 'lucide-svelte';
  import PageHeader from '$lib/components/shared/PageHeader.svelte';
  import Input from '$lib/components/shared/Input.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import * as appStore from '$lib/stores/appStore.svelte.js';
  import { href, go } from '$lib/utils/nav.js';

  const teams = $derived(appStore.getTeams());

  let newTeamName = $state('');
  let showForm = $state(false);

  function handleCreate() {
    if (!newTeamName.trim()) return;
    const id = appStore.createTeam(newTeamName);
    newTeamName = '';
    showForm = false;
    go(`/teams/${id}`);
  }
</script>

<PageHeader title="Play Time">
  {#snippet actions()}
    <a
      href={href('/settings')}
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-950 hover:bg-black text-sm"
    >
      <Settings size={16} /> Settings
    </a>
  {/snippet}
</PageHeader>

<main class="min-h-screen bg-gray-100 p-4">
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-900">Teams</h2>
      <button
        class="flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
        onclick={() => (showForm = !showForm)}
      >
        <Plus size={20} /> New Team
      </button>
    </div>

    {#if showForm}
      <form
        class="bg-white rounded-lg shadow p-4 mb-4 flex gap-2 items-center"
        onsubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <div class="flex-1 [&>input]:w-full">
          <Input placeholder="Team name" bind:value={newTeamName} />
        </div>
        <Button type="submit" disabled={!newTeamName.trim()}>Create</Button>
        <Button variant="secondary" onclick={() => (showForm = false)}>Cancel</Button>
      </form>
    {/if}

    {#if teams.length === 0}
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-lg font-semibold text-gray-900 mb-1">No teams yet</p>
        <p class="text-gray-700">Create a team, add your roster, then start a game.</p>
      </div>
    {:else}
      <ul class="space-y-2">
        {#each teams as team (team.id)}
          {@const live = appStore.getLiveGame(team.id)}
          <li>
            <a
              href={href(`/teams/${team.id}`)}
              class="flex items-center justify-between bg-white rounded-lg shadow px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <div class="text-lg font-semibold text-gray-900">{team.name}</div>
                <div class="text-sm text-gray-700">
                  {team.players.length} player{team.players.length === 1 ? '' : 's'}
                  · {appStore.getGamesForTeam(team.id).filter(g => g.isFinal).length} games played
                </div>
              </div>
              <div class="flex items-center gap-2">
                {#if live}
                  <span class="text-xs font-semibold px-2 py-1 rounded bg-orange-800 text-white">Game in progress</span>
                {/if}
                <ChevronRight size={20} class="text-gray-700" />
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</main>
