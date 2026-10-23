<script lang="ts">
	import MoreVert from '$lib/components/svg-provider/material/MoreVert.svelte';
	import type { TRowAction } from '$lib/trade/types';

	type TMode = TRowAction;

	const MENU: { mode: TMode; label: string; tone: string }[] = [
		{ mode: 'add', label: 'Add', tone: 'text-foreground/80 hover:bg-glass hover:text-foreground' },
		{
			mode: 'reduce',
			label: 'Reduce',
			tone: 'text-foreground/80 hover:bg-glass hover:text-foreground'
		},
		{
			mode: 'stoploss',
			label: 'Stop-loss',
			tone: 'text-foreground/80 hover:bg-glass hover:text-foreground'
		},
		{
			mode: 'target',
			label: 'Target',
			tone: 'text-foreground/80 hover:bg-glass hover:text-foreground'
		},
		{
			mode: 'convert',
			label: 'Convert',
			tone: 'text-foreground/80 hover:bg-glass hover:text-foreground'
		},
		{ mode: 'exit', label: 'Exit', tone: 'text-bearish bg-bearish/10 hover:bg-bearish/15' }
	];

	let {
		onAction,
		convertible = false
	}: { onAction: (mode: TMode) => void; convertible?: boolean } = $props();

	const items = $derived(MENU.filter((item) => convertible || item.mode !== 'convert'));

	let menu = $state<{ top: number; right: number } | null>(null);

	function toggle(event: MouseEvent) {
		if (menu) {
			menu = null;
			return;
		}
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		menu = { top: rect.bottom + 4, right: window.innerWidth - rect.right };
	}

	function pick(mode: TMode) {
		menu = null;
		onAction(mode);
	}

	$effect(() => {
		if (!menu) return;
		const close = () => (menu = null);
		const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
		window.addEventListener('scroll', close, true);
		window.addEventListener('resize', close);
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('scroll', close, true);
			window.removeEventListener('resize', close);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<div class="flex justify-end">
	<button
		type="button"
		aria-label="Actions"
		aria-expanded={!!menu}
		class="bg-surface-elevated border-surface-border/40 text-foreground/80 hover:border-primary/40 hover:text-foreground inline-flex size-7 items-center justify-center rounded-md border transition-colors"
		onclick={toggle}
	>
		<MoreVert class="size-4" />
	</button>
</div>

{#if menu}
	<button
		type="button"
		aria-label="Close menu"
		class="fixed inset-0 z-40 cursor-default"
		onclick={() => (menu = null)}
	></button>
	<div
		role="menu"
		class="bg-surface-elevated border-border-subtle fixed z-50 min-w-40 rounded-lg border p-1.5 shadow-lg"
		style:top="{menu.top}px"
		style:right="{menu.right}px"
	>
		{#each items as item (item.mode)}
			{#if item.mode === 'exit'}
				<div role="separator" class="border-border-subtle my-1.5 border-t"></div>
			{/if}
			<button
				type="button"
				role="menuitem"
				class="block w-full rounded-md px-3 py-2 text-left text-sm transition-colors {item.tone}"
				onclick={() => pick(item.mode)}>{item.label}</button
			>
		{/each}
	</div>
{/if}
