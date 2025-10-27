<script>
  import Input from '$lib/components/shared/Input.svelte';
  import Textarea from '$lib/components/shared/Textarea.svelte';

  let { teamName = $bindable(''), teamDescription = $bindable('') } = $props();
</script>

<div class="mb-6">
  <h2 class="text-xl font-semibold mb-3">Team Information</h2>
  <div class="space-y-3">
    <div>
      <label for="team-name" class="block text-sm font-medium text-gray-700 mb-1">
        Team Name
      </label>
      <Input
        type="text"
        placeholder="Enter team name"
        bind:value={teamName}
      />
    </div>
    <div>
      <label for="team-description" class="block text-sm font-medium text-gray-700 mb-1">
        Team Description
      </label>
      <Textarea
        placeholder="Enter team description (optional)"
        bind:value={teamDescription}
        rows={3}
      />
    </div>
  </div>
</div>
