<script lang="ts">
	import SymbolImage from '$lib/components/symbol-image/SymbolImage.svelte';
	import WatchlistEntryActionPanel from './WatchlistEntryActionPanel.svelte';
	import { formatNumber } from '$lib/utils';
	import { isTradable } from './types';
	import MoreVert from '$lib/components/svg-provider/material/MoreVert.svelte';
	import StickyNote2 from '$lib/components/svg-provider/material/StickyNote2.svelte';

	interface Props {
		name: string;
		exchange?: string;
		instrument?: string;
		companyName?: string | null;
		ltp: number;
		prevClose: number;
		logoUrl?: string;
		canMutate?: boolean;
		hasNote?: boolean;
		onNote?: () => void;
		onRemove?: () => void;
	}

	let {
		name,
		exchange,
		instrument = '',
		companyName = null,
		ltp,
		prevClose,
		logoUrl,
		canMutate = false,
		hasNote = false,
		onNote,
		onRemove
	}: Props = $props();

	const subtitle = $derived(companyName?.trim() || exchange || '');

	const change = $derived(ltp - prevClose);
	const changePct = $derived(prevClose !== 0 ? (change / prevClose) * 100 : 0);
	const isUp = $derived(change >= 0);
	const sign = $derived(change > 0 ? '+' : '');
	const tradable = $derived(isTradable(instrument));
	const showNote = $derived(tradable || canMutate);
	const showDelete = $derived(canMutate);
	const hasActions = $derived(showNote || showDelete);

	let actionsOpen = $state(false);
	let openUp = $state(false);
	let triggerEl = $state<HTMLButtonElement>();
	let isDesktop = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(min-width: 1024px)');
		const sync = () => (isDesktop = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	function openActions() {
		if (!hasActions) return;
		if (triggerEl) {
			const rect = triggerEl.getBoundingClientRect();
			openUp = window.innerHeight - rect.bottom < 160;
		}
		actionsOpen = true;
	}

	function toggleActions() {
		if (actionsOpen) {
			actionsOpen = false;
			return;
		}
		openActions();
	}

	function clickOutside(node: HTMLElement) {
		function onClick(e: MouseEvent) {
			if (actionsOpen && isDesktop && !node.contains(e.target as Node)) actionsOpen = false;
		}
		document.addEventListener('mousedown', onClick);
		return {
			destroy() {
				document.removeEventListener('mousedown', onClick);
			}
		};
	}

	function handleNote() {
		actionsOpen = false;
		onNote?.();
	}

	function handleDelete() {
		actionsOpen = false;
		onRemove?.();
	}
</script>

<div
	role="presentation"
	onmouseleave={() => {
		if (isDesktop) actionsOpen = false;
	}}
	class="group relative flex items-center gap-3 px-4 lg:px-3 py-2 border-b border-border-subtle hover:bg-glass transition-colors"
>
	{#if hasActions}
		<button
			type="button"
			onclick={openActions}
			aria-label="Actions for {name}"
			class="absolute inset-0 z-10 cursor-pointer lg:hidden"
		></button>
	{/if}

	<SymbolImage {name} {logoUrl} class="w-9 h-9 shrink-0 group-hover:border-primary/20" />

	<div class="flex-1 min-w-0 flex items-center justify-between gap-2">
		<div class="flex flex-col min-w-0">
			<span class="flex items-center gap-1 min-w-0">
				<span class="text-xs text-foreground truncate">{name}</span>
				{#if hasNote}
					<span title="Has note" class="flex shrink-0">
						<StickyNote2 class="text-primary" style="font-size:0.75rem" />
					</span>
				{/if}
			</span>
			{#if subtitle}
				<span class="text-[0.625rem] text-muted-foreground truncate">{subtitle}</span>
			{/if}
		</div>

		<div class="flex items-center shrink-0">
			<div
				class="flex flex-col items-end {actionsOpen && isDesktop
					? 'hidden'
					: hasActions
						? 'lg:group-hover:hidden'
						: ''}"
			>
				<span class="text-xs text-foreground">{formatNumber(ltp)}</span>
				<span class="text-[0.625rem] {isUp ? 'text-bullish' : 'text-bearish'}">
					{sign}{formatNumber(change)} ({sign}{formatNumber(changePct)}%)
				</span>
			</div>

			{#if hasActions}
				<div use:clickOutside class="relative flex items-center">
					<button
						bind:this={triggerEl}
						type="button"
						onclick={toggleActions}
						aria-label="More actions"
						title="More"
						class="w-7 h-7 items-center justify-center rounded bg-glass border border-border-subtle text-muted-foreground hover:text-primary hover:border-primary/30 cursor-pointer transition-colors
						{actionsOpen && isDesktop
							? 'flex text-primary border-primary/30'
							: 'hidden lg:group-hover:flex'}"
					>
						<MoreVert style="font-size:0.875rem" />
					</button>

					<WatchlistEntryActionPanel
						isOpen={actionsOpen}
						{isDesktop}
						{openUp}
						symbolName={name}
						{showNote}
						{showDelete}
						{hasNote}
						onNote={handleNote}
						onDelete={handleDelete}
						onClose={() => (actionsOpen = false)}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
