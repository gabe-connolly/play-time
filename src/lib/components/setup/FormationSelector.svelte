<script>
  let { sport, teamSize, formation, onSelect } = $props();

  const formations = $derived(
    sport && teamSize ? sport.getFormationsForTeamSize(teamSize) : []
  );
</script>

{#if formations.length > 0}
  <div class="mb-6">
    <h2 class="text-xl font-semibold mb-3">Formation</h2>
    <div class="flex gap-2 flex-wrap">
      {#each formations as f}
        <button
          class={`px-4 py-2 rounded-lg font-medium ${
            formation?.name === f.name
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onclick={() => onSelect(f)}
        >
          {f.name}
        </button>
      {/each}
    </div>
  </div>
{/if}
