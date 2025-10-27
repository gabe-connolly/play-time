<script>
  import Input from '$lib/components/shared/Input.svelte';
  import Textarea from '$lib/components/shared/Textarea.svelte';

  let { teamName = '', teamDescription = '', onNameChange, onDescriptionChange } = $props();
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
        value={teamName}
        oninput={(e) => onNameChange?.(e.target.value)}
      />
    </div>
    <div>
      <label for="team-description" class="block text-sm font-medium text-gray-700 mb-1">
        Team Description
      </label>
      <Textarea
        placeholder="Enter team description (optional)"
        value={teamDescription}
        oninput={(e) => onDescriptionChange?.(e.target.value)}
        rows={3}
      />
    </div>
  </div>
</div>
