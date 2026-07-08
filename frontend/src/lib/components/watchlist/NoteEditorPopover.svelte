<script lang="ts">
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import type { TOpResult } from './types';

	interface Props {
		isOpen: boolean;
		symbolName: string;
		initialNote: string;
		onClose: () => void;
		onSave: (note: string) => Promise<TOpResult>;
		onClear?: () => Promise<TOpResult>;
	}

	let { isOpen, symbolName, initialNote, onClose, onSave, onClear }: Props = $props();

	let modalOpen = $state(false);
	let note = $state('');
	let saving = $state(false);
	let error = $state<string | null>(null);
	let inputEl = $state<HTMLTextAreaElement>();

	$effect(() => {
		modalOpen = isOpen;
		if (isOpen) {
			note = initialNote;
			error = null;
			setTimeout(() => inputEl?.focus(), 50);
		}
	});

	const trimmed = $derived(note.trim());
	const isDirty = $derived(trimmed !== initialNote.trim());

	function close() {
		modalOpen = false;
		onClose();
	}

	async function save() {
		if (!trimmed) {
			error = 'Note cannot be empty.';
			return;
		}
		saving = true;
		error = null;
		const res = await onSave(trimmed);
		saving = false;
		if (res.ok) close();
		else error = res.error;
	}

	async function clear() {
		if (!onClear || !initialNote.trim()) {
			close();
			return;
		}
		saving = true;
		error = null;
		const res = await onClear();
		saving = false;
		if (res.ok) close();
		else error = res.error;
	}
</script>

<SvaKoshModal bind:isOpen={modalOpen} onClose={close} position="center">
	{#snippet title()}
		<span class="text-sm text-foreground">Note for {symbolName}</span>
		<span class="text-xs text-muted-foreground">
			Private note for this symbol in this watchlist.
		</span>
	{/snippet}

	<div class="flex flex-col gap-4 p-4">
		<textarea
			bind:this={inputEl}
			bind:value={note}
			placeholder="Type your note..."
			maxlength="500"
			rows="4"
			disabled={saving}
			class="w-full px-3 py-2 text-xs text-foreground bg-glass border border-border-subtle rounded outline-none focus:border-primary resize-none disabled:opacity-50"
		></textarea>

		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span>{trimmed.length}/500</span>
			{#if error}<span class="text-error">{error}</span>{/if}
		</div>

		<div class="flex justify-between gap-2">
			{#if initialNote.trim()}
				<button
					type="button"
					onclick={clear}
					disabled={saving}
					class="px-3 py-1.5 text-xs text-bearish hover:text-bearish cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
				>
					Clear note
				</button>
			{:else}
				<span></span>
			{/if}
			<div class="flex gap-2">
				<button
					type="button"
					onclick={close}
					disabled={saving}
					class="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={save}
					disabled={saving || !isDirty || !trimmed}
					class="px-3 py-1.5 text-xs text-primary bg-primary-subtle border border-primary/20 hover:bg-primary-hover rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{saving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</div>
	</div>
</SvaKoshModal>
