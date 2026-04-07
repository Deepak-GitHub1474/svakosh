<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type CandlePreset = 'standard' | 'bull' | 'bear' | 'bars';

	const candlePaths: Record<CandlePreset, string> = {
		standard: 'M11 2h2v4h-2V2zm-4 4h10v12H7V6zm4 12h2v4h-2v-4z',
		bull: 'M11 5h2v3h-2V5zm-5 3h12v8H6V8zm5 8h2v3h-2v-3z',
		bear: 'M11 2h2v6h-2V2zm-6 6h14v8H5V8zm6 8h2v6h-2v-6z',
		bars: 'M4 10h4v11H4V10zm6-6h4v17h-4V4zm6 9h4v8h-4v-8z'
	};

	type Variant = 'primary' | 'secondary' | 'bullish' | 'bearish';

	type Props = {
		variant: Variant;
		label: string;
		class?: string;
		shine?: boolean;
		candle?: CandlePreset;
		icon?: Snippet;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (e: MouseEvent) => void | Promise<void>;
	};

	let {
		variant,
		label,
		class: className,
		shine = false,
		candle,
		icon,
		disabled = false,
		type = 'button',
		onclick
	}: Props = $props();

	const buttonClass = $derived(
		cn('btn-terminal', `btn-terminal--${variant}`, shine && 'btn-terminal--shine', className)
	);
</script>

<button {type} class={buttonClass} {disabled} aria-label={label} {onclick}>
	{#if icon}
		<span class="btn-terminal__icon">{@render icon()}</span>
	{:else if candle !== undefined}
		<svg class="btn-terminal__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d={candlePaths[candle]} />
		</svg>
	{/if}
	<span class="btn-terminal__label select-none">{label}</span>
</button>
