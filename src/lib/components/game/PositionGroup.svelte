<script>
  import { getDisplayName } from '$lib/utils/displayName.js';

  let {
    position,
    players,
    needed,
    displayFormat = 'full',
    substitutingPlayerId = null,
    onPlayerClick
  } = $props();

  const slots = $derived(
    Array(needed).fill(null).map((_, i) => players[i] || null)
  );
</script>

<div class="bg-white/10 rounded-lg p-3">
  <div class="flex items-center justify-between mb-2">
    <h3 class="text-white font-semibold">{position.name}</h3>
    <span class="text-white text-sm">
      {players.length}/{needed}
    </span>
  </div>

  <div class="grid grid-cols-4 gap-2">
    {#each slots as player, idx (idx)}
      <button
        class={`${position.color} rounded-lg p-3 text-center min-h-[60px] flex flex-col items-center justify-center hover:opacity-80 transition-opacity ${
          substitutingPlayerId === player?.id ? 'ring-2 ring-red-500' : ''
        }`}
        onclick={() => player && onPlayerClick?.(player.id)}
        disabled={!player}
      >
        {#if player}
          <div class="font-semibold text-sm">
            {getDisplayName(player, displayFormat)}
          </div>
          {#if player.jerseyNumber}
            <div class="text-xs mt-1">#{player.jerseyNumber}</div>
          {/if}
          {#if substitutingPlayerId === player.id}
            <div class="text-xs mt-1 text-red-700 font-bold">
              Subbing out
            </div>
          {/if}
        {:else}
          <div class="text-sm text-gray-600">Empty</div>
        {/if}
      </button>
    {/each}
  </div>
</div>
