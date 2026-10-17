<script>
  import { Undo2 } from 'lucide-svelte';

  let {
    stats,
    armedStatId = null,
    lastEventText = null,
    onArm,
    onUndo = null
  } = $props();

  const armedStat = $derived(stats.find(s => s.id === armedStatId) ?? null);

  // Cards keep their real-world colours; every other stat shares one style.
  function statClass(stat) {
    if (stat.id === armedStatId) return 'bg-orange-800 text-white ring-2 ring-white';
    if (stat.id === 'yellowCards') return 'bg-yellow-300 text-gray-900 hover:bg-yellow-200';
    if (stat.id === 'redCards') return 'bg-red-800 text-white hover:bg-red-900';
    return 'bg-white/90 text-green-950 hover:bg-white';
  }
</script>

<div class="shrink-0 mt-2 bg-green-800 rounded-lg px-3 py-2 flex items-center gap-3" role="region" aria-label="Stat tracker">
  <div class="w-24 shrink-0">
    <h3 class="text-white font-semibold leading-tight">Stat tracker</h3>
  </div>

  <div class="flex-1 min-w-0 flex flex-col gap-2">
    <div class="flex flex-wrap gap-1.5">
      {#each stats as stat (stat.id)}
        <button
          class="px-3 min-h-10 rounded-lg text-sm font-semibold transition-colors {statClass(stat)}"
          aria-pressed={stat.id === armedStatId}
          onclick={() => onArm(stat.id === armedStatId ? null : stat.id)}
        >
          {stat.label}
        </button>
      {/each}
    </div>

    {#if armedStat}
      <p class="text-sm text-white" role="status">
        Tap the player on the field who made the <strong>{armedStat.label.toLowerCase()}</strong>, or tap it again to cancel.
      </p>
    {:else if lastEventText}
      <div class="flex items-center gap-2 text-sm text-white">
        <span class="truncate" role="status">Last: {lastEventText}</span>
        {#if onUndo}
          <button
            class="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-950 text-white hover:bg-black"
            onclick={onUndo}
          >
            <Undo2 size={14} /> Undo
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>
