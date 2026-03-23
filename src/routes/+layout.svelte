<script>
  import '../app.css';
  import UpdateBanner from '$lib/components/shared/UpdateBanner.svelte';
</script>

<svelte:head>
  <meta name="theme-color" content="#2563eb" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <title>Field Coach</title>
</svelte:head>

<slot />
<UpdateBanner />
