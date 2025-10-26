<script>
  import { getDisplayName } from '$lib/utils/displayName.js';

  let {
    substitutingPlayer,
    selectedBenchPlayerId,
    displayFormat = 'full',
    onMoveToBench,
    onCompleteSubstitution,
    onCancel
  } = $props();

  const canComplete = $derived(selectedBenchPlayerId !== null);
</script>

<div class="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
  <h3 class="font-bold text-lg mb-2">Select Substitute</h3>
  <p class="text-sm text-gray-600 mb-3">
    Subbing out: <strong>{getDisplayName(substitutingPlayer, displayFormat)}</strong>
  </p>
  <div class="flex gap-2 flex-wrap">
    <button
      class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      onclick={onMoveToBench}
    >
      Move to Bench
    </button>
    {#if canComplete}
      <button
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onclick={onCompleteSubstitution}
      >
        Complete Substitution
      </button>
    {/if}
    <button
      class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
      onclick={onCancel}
    >
      Cancel
    </button>
  </div>
</div>
