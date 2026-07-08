<script lang="ts">
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import type { TOpResult } from './types';

	interface Props {
		isOpen: boolean;
		title: string;
		submitLabel: string;
		initialName?: string;
		onClose: () => void;
		onSubmit: (name: string) => Promise<TOpResult>;
	}

	let {
		isOpen,
		title,
		submitLabel,
		initialName = '',
		onClose,
		onSubmit
	}: Props = $props();

	let modalOpen = $state(false);
	let name = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let inputEl = $state<HTMLInputElement>();

	$effect(() => {
		modalOpen = isOpen;
		if (isOpen) {
			name = initialName;
			error = null;
			setTimeout(() => {
				inputEl?.focus();
				inputEl?.select();
			}, 50);
		}
	});

	const isDirty = $derived(name.trim().length > 0 && name.trim() !== initialName.trim());

	function close() {
		modalOpen = false;
		onClose();
	}

	async function handleSubmit() {
		const trimmed = name.trim();
		if (!trimmed) {
			error = 'Name is required.';
			return;
		}
		if (trimmed === initialName.trim()) {
			close();
			return;
		}
		isLoading = true;
		error = null;
		const res = await onSubmit(trimmed);
		isLoading = false;
		if (res.ok) close();
		else error = res.error;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<SvaKoshModal bind:isOpen={modalOpen} onClose={close} width="20rem" position="center" {title}>
	<div class="flex flex-col gap-3 p-3">
		<input
			bind:this={inputEl}
			bind:value={name}
			type="text"
			placeholder="Watchlist name"
			maxlength="64"
			disabled={isLoading}
			onkeydown={handleKeydown}
			class="w-full px-3 py-2 text-xs text-foreground bg-glass border border-border-subtle rounded outline-none focus:border-primary disabled:opacity-50"
		/>

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
				onclick={handleSubmit}
				disabled={isLoading || !isDirty}
				class="px-3 py-1.5 text-xs text-primary bg-primary-subtle border border-primary/20 hover:bg-primary-hover rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? 'Saving...' : submitLabel}
			</button>
		</div>
	</div>
</SvaKoshModal>
