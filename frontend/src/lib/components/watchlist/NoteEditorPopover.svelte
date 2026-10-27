<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import ModalHeader from '$lib/components/trade/ModalHeader.svelte';
	import TradeSheet from '$lib/components/trade/TradeSheet.svelte';
	import { MODAL_ACTION, MODAL_ACTIONS } from '$lib/trade/const';
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
	let inputEl = $state<HTMLTextAreaElement>();

	$effect(() => {
		modalOpen = isOpen;
		if (isOpen) {
			note = initialNote;
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
			toast.error({ description: 'Note cannot be empty.' });
			return;
		}
		saving = true;
		const res = await onSave(trimmed);
		saving = false;
		if (res.ok) close();
		else toast.error({ description: res.error });
	}

	async function clear() {
		if (!onClear || !initialNote.trim()) {
			close();
			return;
		}
		saving = true;
		const res = await onClear();
		saving = false;
		if (res.ok) close();
		else toast.error({ description: res.error });
	}
</script>

{#snippet actions()}
	<div class={MODAL_ACTIONS}>
		<SvaKoshButton
			variant="secondary"
			label="Cancel"
			disabled={saving}
			onclick={close}
			class="{MODAL_ACTION} [--terminal-border-hover:transparent] [--terminal-border:transparent]"
		/>
		<SvaKoshButton
			variant="solid"
			label={saving ? 'Saving…' : 'Save note'}
			disabled={saving || !isDirty || !trimmed}
			onclick={save}
			class={MODAL_ACTION}
		/>
	</div>
{/snippet}

<TradeSheet bind:isOpen={modalOpen} onClose={close} width="26rem" footer={actions}>
	<ModalHeader title={`Note for ${symbolName}`} onClose={close} />
	<div class="flex flex-col gap-4 p-4">
		<div>
			<div class="mb-1.5 flex items-center justify-between gap-2">
				<SvaKoshLabel for="watchlist-note" class="text-foreground/80 mb-0">Note</SvaKoshLabel>
				<span class="text-muted-foreground text-xs tabular-nums">{trimmed.length}/500</span>
			</div>
			<textarea
				id="watchlist-note"
				bind:this={inputEl}
				bind:value={note}
				placeholder="Type your note..."
				maxlength="500"
				rows="4"
				disabled={saving}
				class="glass-panel text-foreground placeholder:text-muted-foreground hover:border-primary/40 focus:border-primary/40 w-full resize-none rounded-xl p-3 text-[0.857rem] focus:outline-none disabled:opacity-50"
			></textarea>
		</div>
		{#if initialNote.trim()}
			<button
				type="button"
				onclick={clear}
				disabled={saving}
				class="text-bearish hover:text-bearish/80 self-start text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			>
				Clear note
			</button>
		{/if}
	</div>
</TradeSheet>
