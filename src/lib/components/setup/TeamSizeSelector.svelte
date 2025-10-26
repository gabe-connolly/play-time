<script>
  let { sport, teamSize, onSelect } = $props();

  const availableSizes = $derived(sport ? sport.getAvailableTeamSizes() : []);
</script>

{#if sport}
  <div class="mb-6">
    <h2 class="text-xl font-semibold mb-3">Team Size</h2>
    <div class="flex gap-2 flex-wrap">
      {#each availableSizes as size}
        <button
          class={`px-4 py-2 rounded-lg font-medium ${
            teamSize === size
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onclick={() => onSelect(size)}
        >
          {size}v{size}
        </button>
      {/each}
    </div>
  </div>
{/if}
