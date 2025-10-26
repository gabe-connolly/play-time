<script>
  import Button from '../shared/Button.svelte';
  import Input from '../shared/Input.svelte';

  let { initialData = null, onSubmit, onCancel } = $props();

  let firstName = $state(initialData?.firstName || '');
  let lastName = $state(initialData?.lastName || '');
  let nickname = $state(initialData?.nickname || '');
  let jerseyNumber = $state(initialData?.jerseyNumber || '');

  function handleSubmit() {
    if (firstName && lastName) {
      onSubmit({ firstName, lastName, nickname, jerseyNumber });

      // Reset form if adding new player
      if (!initialData) {
        firstName = '';
        lastName = '';
        nickname = '';
        jerseyNumber = '';
      }
    }
  }
</script>

<div class="bg-gray-50 p-4 rounded-lg">
  <h3 class="font-semibold mb-3">{initialData ? 'Edit Player' : 'New Player'}</h3>
  <div class="grid grid-cols-2 gap-3">
    <Input
      type="text"
      placeholder="First Name *"
      bind:value={firstName}
    />
    <Input
      type="text"
      placeholder="Last Name *"
      bind:value={lastName}
    />
    <Input
      type="text"
      placeholder="Nickname"
      bind:value={nickname}
    />
    <Input
      type="text"
      placeholder="Jersey #"
      bind:value={jerseyNumber}
    />
    <div class="col-span-2 flex gap-2">
      <Button
        variant="primary"
        onclick={handleSubmit}
        disabled={!firstName || !lastName}
      >
        {initialData ? 'Save' : 'Add'}
      </Button>
      <Button variant="secondary" onclick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
</div>
