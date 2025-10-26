<script>
  import SportSelector from '$lib/components/setup/SportSelector.svelte';
  import TeamSizeSelector from '$lib/components/setup/TeamSizeSelector.svelte';
  import FormationSelector from '$lib/components/setup/FormationSelector.svelte';
  import PlayerList from '$lib/components/setup/PlayerList.svelte';
  import Button from '$lib/components/shared/Button.svelte';
  import * as teamStore from '$lib/stores/teamStore.svelte.js';
  import * as gameStore from '$lib/stores/gameStore.svelte.js';

  const team = $derived(teamStore.getTeam());
  const sport = $derived(teamStore.getSport());
  const teamSize = $derived(teamStore.getTeamSize());
  const formation = $derived(teamStore.getFormation());
  const players = $derived(teamStore.getPlayers());

  const canStartGame = $derived(
    sport && formation && players.length > 0
  );

  $effect(() => {
    if (team) {
      teamStore.saveTeam(team);
    }
  })

  function handleStartGame() {
    if (canStartGame) {
      gameStore.goToGame();
    }
  }


</script>

<div class="min-h-screen bg-gray-100 p-4">
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg p-6 mb-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Field Coach Setup</h1>

      <SportSelector
        selectedSport={sport}
        onSelect={teamStore.setSport}
      />

      <TeamSizeSelector
        {sport}
        {teamSize}
        onSelect={teamStore.setTeamSize}
      />

      <FormationSelector
        {sport}
        {teamSize}
        {formation}
        onSelect={teamStore.setFormation}
      />

      <PlayerList
        {players}
        onAdd={teamStore.addPlayer}
        onUpdate={teamStore.updatePlayer}
        onDelete={teamStore.deletePlayer}
      />

      {#if canStartGame}
        <Button
          variant="primary"
          onclick={handleStartGame}
        >
          <span class="text-lg">Start Game →</span>
        </Button>
      {/if}
    </div>
  </div>
</div>
