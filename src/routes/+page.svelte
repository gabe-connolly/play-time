<script>
  import SetupView from '$src/views/SetupView.svelte';
  import GameView from '$src/views/GameView.svelte';
  import * as gameStore from '$lib/stores/gameStore.svelte.js';

  const currentView = $derived(gameStore.getCurrentView());
</script>

{#if currentView === 'setup'}
  <SetupView />
{:else}
  <GameView />
{/if}
