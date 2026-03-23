<script>
	import { onMount } from 'svelte';

	let show = $state(false);

	onMount(() => {
		function onUpdate() {
			show = true;
		}
		window.addEventListener('sw-update-available', onUpdate);
		return () => window.removeEventListener('sw-update-available', onUpdate);
	});

	function apply() {
		const reg = navigator.serviceWorker?.getRegistration?.();
		navigator.serviceWorker?.ready?.then((registration) => {
			registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
		});
	}

	function dismiss() {
		show = false;
	}
</script>

{#if show}
	<div class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-blue-600 px-4 py-3 text-white text-sm">
		<span>Update available</span>
		<div class="flex gap-3">
			<button onclick={apply} class="font-semibold underline">Refresh</button>
			<button onclick={dismiss} class="opacity-75">Dismiss</button>
		</div>
	</div>
{/if}
