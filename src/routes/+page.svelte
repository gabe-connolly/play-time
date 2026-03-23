<script>
  import { onMount } from 'svelte';
  import SetupView from '$src/views/SetupView.svelte';
  import GameView from '$src/views/GameView.svelte';
  import * as gameStore from '$lib/stores/gameStore.svelte.js';
  import * as teamStore from '$lib/stores/teamStore.svelte.js';

  const currentView = $derived(gameStore.getCurrentView());

  onMount(() => {
    teamStore.restoreTeam();
    gameStore.restoreGameState();
  });
</script>

{#if currentView === 'setup'}
  <SetupView />
{:else}
  <GameView />
{/if}
