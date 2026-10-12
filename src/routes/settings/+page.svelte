<script>
  import { onMount } from 'svelte';
  import { Download, Upload } from 'lucide-svelte';
  import { Capacitor } from '@capacitor/core';
  import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
  import { Share } from '@capacitor/share';
  import { App } from '@capacitor/app';
  import PageHeader from '$lib/components/shared/PageHeader.svelte';
  import * as appStore from '$lib/stores/appStore.svelte.js';
  import { href, go } from '$lib/utils/nav.js';

  const settings = $derived(appStore.getSettings());

  let message = $state(null); // { kind: 'ok' | 'error', text }
  let version = $state('');
  let fileInput;

  onMount(async () => {
    if (Capacitor.isNativePlatform()) {
      const info = await App.getInfo();
      version = `${info.version} (${info.build})`;
    }
  });

  const formats = [
    { value: 'full', label: 'First Last' },
    { value: 'nickname', label: 'Nickname' },
    { value: 'last', label: 'Last, F.' }
  ];

  function exportFileName() {
    return `play-time-backup-${new Date().toISOString().slice(0, 10)}.json`;
  }

  async function handleExport() {
    message = null;
    const text = appStore.exportText();
    try {
      if (Capacitor.isNativePlatform()) {
        const { uri } = await Filesystem.writeFile({
          path: exportFileName(),
          data: text,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        await Share.share({ title: 'Play Time backup', files: [uri] });
      } else {
        const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = exportFileName();
        a.click();
        URL.revokeObjectURL(url);
      }
      message = { kind: 'ok', text: 'Backup exported.' };
    } catch (error) {
      if (!String(error?.message).toLowerCase().includes('cancel')) {
        message = { kind: 'error', text: `Export failed: ${error.message}` };
      }
    }
  }

  async function handleImportFile(event) {
    message = null;
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const counts = await appStore.importText(await file.text());
      message = { kind: 'ok', text: `Imported ${counts.teams} team(s) and ${counts.games} game(s).` };
    } catch (error) {
      message = { kind: 'error', text: `Import failed: ${error.message}` };
    }
  }

  async function handleClearAll() {
    if (confirm('Delete every team, player and game on this device? Export a backup first if you might need it.')) {
      await appStore.clearAll();
      go('/', { replaceState: true });
    }
  }
</script>

<PageHeader title="Settings" backHref={href('/')} backLabel="Teams" />

<main class="min-h-screen bg-gray-100 p-4">
  <div class="max-w-3xl mx-auto space-y-4">
    <section class="bg-white rounded-lg shadow p-5">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Player names during games</h2>
      <div class="flex gap-2 flex-wrap">
        {#each formats as f (f.value)}
          <button
            class="px-4 py-2 rounded-lg font-medium {settings.displayFormat === f.value
              ? 'bg-blue-800 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}"
            onclick={() => appStore.updateSettings({ displayFormat: f.value })}
          >
            {f.label}
          </button>
        {/each}
      </div>
    </section>

    <section class="bg-white rounded-lg shadow p-5">
      <h2 class="text-lg font-semibold text-gray-900 mb-1">Backup</h2>
      <p class="text-gray-700 mb-3">
        Your teams and games are stored only on this device. Export a backup file to keep a copy or move to a new device.
      </p>
      <div class="flex gap-2 flex-wrap">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-800 text-white font-medium hover:bg-blue-900"
          onclick={handleExport}
        >
          <Download size={18} /> Export backup
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-300 text-gray-900 font-medium hover:bg-gray-200"
          onclick={() => fileInput.click()}
        >
          <Upload size={18} /> Import backup
        </button>
        <input
          bind:this={fileInput}
          type="file"
          accept="application/json,.json"
          class="hidden"
          onchange={handleImportFile}
        />
      </div>
      {#if message}
        <p class="mt-3 text-sm {message.kind === 'ok' ? 'text-green-900' : 'text-red-800'}" role="status">{message.text}</p>
      {/if}
      <p class="text-sm text-gray-700 mt-3">Importing adds to what's here; records already on this device are updated.</p>
    </section>

    <section class="bg-white rounded-lg shadow p-5">
      <h2 class="text-lg font-semibold text-gray-900 mb-1">Privacy</h2>
      <p class="text-gray-700">
        Play Time collects nothing. It has no accounts, ads or analytics, and never sends your roster anywhere.
        Data leaves this device only when you export a backup.
      </p>
      <p class="text-gray-700 mt-2">
        Full policy: <a class="text-blue-800 underline" href="https://justforyou.games/privacy" target="_blank" rel="noopener">justforyou.games/privacy</a>
        · Questions: <a class="text-blue-800 underline" href="mailto:hello@justforyou.games">hello@justforyou.games</a>
      </p>
    </section>

    <section class="bg-white rounded-lg shadow p-5 flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Erase everything</h2>
        <p class="text-gray-700">Removes all teams, rosters and game history from this device.</p>
      </div>
      <button class="px-4 py-2 rounded-lg bg-red-800 text-white font-medium hover:bg-red-900" onclick={handleClearAll}>
        Clear all data
      </button>
    </section>

    {#if version}
      <p class="text-center text-sm text-gray-700">Play Time {version}</p>
    {/if}
  </div>
</main>
