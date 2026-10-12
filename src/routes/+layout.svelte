<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import UpdateBanner from '$lib/components/shared/UpdateBanner.svelte';
  import * as appStore from '$lib/stores/appStore.svelte.js';
  import * as gameStore from '$lib/stores/gameStore.svelte.js';

  let { children } = $props();

  const ready = $derived(appStore.isReady());
  const loadError = $derived(appStore.getLoadError());

  onMount(() => {
    gameStore.restoreTimer();
    appStore.init();
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#14532d" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <title>Play Time</title>
</svelte:head>

{#if ready}
  {#if loadError}
    <div class="bg-red-800 text-white text-sm px-4 py-2" role="alert">
      Saved data could not be read ({loadError}). Starting empty; import a backup from Settings.
    </div>
  {/if}
  {@render children()}
{:else}
  <div class="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800">Loading…</div>
{/if}
<UpdateBanner />
