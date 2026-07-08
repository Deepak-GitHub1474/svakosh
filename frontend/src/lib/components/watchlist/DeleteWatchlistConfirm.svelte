<script lang="ts">
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import type { TOpResult } from './types';

	interface Props {
		isOpen: boolean;
		watchlistName: string;
		onClose: () => void;
		onConfirm: () => Promise<TOpResult>;
	}

	let { isOpen, watchlistName, onClose, onConfirm }: Props = $props();

	let modalOpen = $state(false);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		modalOpen = isOpen;
		if (isOpen) error = null;
	});

	function close() {
		if (isLoading) return;
		modalOpen = false;
		onClose();
	}

	async function handleConfirm() {
		isLoading = true;
		error = null;
		const res = await onConfirm();
		isLoading = false;
		if (res.ok) close();
		else error = res.error;
	}
</script>

<SvaKoshModal
	bind:isOpen={modalOpen}
	onClose={close}
	width="20rem"
	position="center"
	title="Delete watchlist?"
>
	<div class="flex flex-col gap-3 p-3">
		<p class="text-[0.625rem] text-muted-foreground">
			This permanently removes "{watchlistName}" and all its symbols. Cannot be undone.
		</p>

		{#if error}
			<span class="text-[0.625rem] text-error">{error}</span>
		{/if}

		<div class="flex justify-end gap-2">
			<button
				type="button"
				onclick={close}
				disabled={isLoading}
				class="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleConfirm}
				disabled={isLoading}
				class="px-3 py-1.5 text-xs text-error bg-error-subtle border border-error/30 hover:bg-error-hover rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? 'Deleting...' : 'Delete'}
			</button>
		</div>
	</div>
</SvaKoshModal>
