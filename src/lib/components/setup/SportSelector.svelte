<script>
  import { getAllSports } from '$lib/config/sports.js';

  let { selectedSport = null, onSelect } = $props();

  const sports = getAllSports();
</script>

<div class="mb-6">
  <h2 class="text-xl font-semibold mb-3">Select Sport</h2>
  <div class="flex gap-4">
    {#each sports as sport}
      <button
        class={`px-6 py-3 rounded-lg font-medium transition-colors ${
          selectedSport?.id === sport.id
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onclick={() => onSelect(sport)}
      >
        {sport.name}
      </button>
    {/each}
  </div>
</div>
