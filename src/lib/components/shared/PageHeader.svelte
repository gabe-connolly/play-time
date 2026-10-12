<script>
  import { ChevronLeft } from 'lucide-svelte';

  let { title, backHref = null, backLabel = 'Back', actions = null } = $props();
</script>

<header class="bg-green-900 text-white">
  <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
    {#if backHref}
      <a
        href={backHref}
        class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-950 hover:bg-black text-sm shrink-0"
      >
        <ChevronLeft size={16} /> {backLabel}
      </a>
    {/if}
    <h1 class="text-xl font-bold truncate flex-1">{title}</h1>
    {#if actions}
      <div class="flex items-center gap-2 shrink-0">{@render actions()}</div>
    {/if}
  </div>
</header>
