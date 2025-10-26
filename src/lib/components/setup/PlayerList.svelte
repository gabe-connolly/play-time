<script>
  import { Plus } from 'lucide-svelte';
  import PlayerCard from '../game/PlayerCard.svelte';
  import PlayerForm from './PlayerForm.svelte';

  let { players, onAdd, onUpdate, onDelete } = $props();

  let showAddForm = $state(false);
  let editingPlayerId = $state(null);

  function handleAdd(playerData) {
    onAdd(playerData);
    showAddForm = false;
  }

  function handleUpdate(playerData) {
    onUpdate(editingPlayerId, playerData);
    editingPlayerId = null;
  }

  const playerToEdit = $derived(
    editingPlayerId ? players.find(p => p.id === editingPlayerId) : null
  );
</script>

<div class="mb-6">
  <div class="flex justify-between items-center mb-3">
    <h2 class="text-xl font-semibold">Players ({players.length})</h2>
    <button
      class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      onclick={() => showAddForm = !showAddForm}
    >
      <Plus size={20} /> Add Player
    </button>
  </div>

  {#if showAddForm}
    <div class="mb-4">
      <PlayerForm
        onSubmit={handleAdd}
        onCancel={() => showAddForm = false}
      />
    </div>
  {/if}

  <div class="space-y-2">
    {#if players.length === 0}
      <p class="text-gray-500 text-center py-8">No players added yet</p>
    {:else}
      {#each players as player (player.id)}
        {#if editingPlayerId === player.id}
          <PlayerForm
            initialData={playerToEdit}
            onSubmit={handleUpdate}
            onCancel={() => editingPlayerId = null}
          />
        {:else}
          <PlayerCard
            {player}
            showActions={true}
            onEdit={() => editingPlayerId = player.id}
            onDelete={() => onDelete(player.id)}
          />
        {/if}
      {/each}
    {/if}
  </div>
</div>
