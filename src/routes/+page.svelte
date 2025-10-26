<script>
  import SetupView from './SetupView.svelte';
  import GameView from './GameView.svelte';
  import * as gameStore from '$lib/stores/gameStore.svelte.js';

  const currentView = $derived(gameStore.getCurrentView());
</script>

{#if currentView === 'setup'}
  <SetupView />
{:else}
  <GameView />
{/if}
