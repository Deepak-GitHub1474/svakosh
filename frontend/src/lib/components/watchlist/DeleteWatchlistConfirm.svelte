<script lang="ts">
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import type { TOpResult } from './types';

	interface Props {
		isOpen: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		loadingLabel?: string;
		onClose: () => void;
		onConfirm: () => Promise<TOpResult>;
	}

	let {
		isOpen,
		title,
		description,
		confirmLabel = 'Delete',
		loadingLabel = 'Deleting...',
		onClose,
		onConfirm
	}: Props = $props();

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		if (isOpen) {
			error = null;
			isLoading = false;
		}
	});

	function close() {
		if (isLoading) return;
		onClose();
	}

	async function handleConfirm() {
		isLoading = true;
		error = null;
		const res = await onConfirm();
		isLoading = false;
		if (res.ok) onClose();
		else error = res.error;
	}
</script>

{#if isOpen}
	<SvaKoshModal isOpen={true} onClose={close} position="center" {title}>
		<div class="flex flex-col gap-4 p-4">
			<p class="text-xs text-muted-foreground">{description}</p>

			{#if error}
				<span class="text-xs text-error">{error}</span>
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
					{isLoading ? loadingLabel : confirmLabel}
				</button>
			</div>
		</div>
	</SvaKoshModal>
{/if}
