<script lang="ts">
	import MinusIcon from '$lib/components/svg-provider/MinusIcon.svelte';
	import PlusIcon from '$lib/components/svg-provider/PlusIcon.svelte';
	import { cn } from '$lib/utils';

	type Props = {
		value: number;
		label?: string;
		min?: number;
		max?: number;
		step?: number;
		emptyValue?: number;
		class?: string;
	};

	let { 
		value = $bindable(), 
		label, 
		min = 0, 
		max = 100, 
		step = 1,
		emptyValue,
		class: className = '' 
	}: Props = $props();

	const decimals = $derived((String(step).split('.')[1] ?? '').length);
	const round = (n: number) => Number(n.toFixed(decimals));

	function increment() {
		const next = round(value + step);
		if (next <= max) value = next;
	}

	function decrement() {
		const next = round(value - step);
		if (next >= min) value = next;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.value.trim() === '') {
			if (emptyValue !== undefined) value = emptyValue;
			return;
		}
		const val = decimals ? parseFloat(target.value) : parseInt(target.value);
		if (isNaN(val)) return;
		value = Math.min(max, Math.max(min, val));
		if (val > max) target.value = String(max);
	}

	function handleFocus(e: FocusEvent) {
		const target = e.currentTarget as HTMLInputElement;
		target.select();
	}
</script>

<div class={cn('relative svakosh-number-input', className)}>
	{#if label}
		<div class="absolute -top-2 left-4 flex items-center gap-1.5 bg-background z-10 select-none">
			<span class="text-xs capitalize text-muted-foreground tracking-wider">{label}</span>
		</div>
	{/if}
	
	<div class="glass-panel group flex items-center rounded-xl p-1 transition-all hover:border-primary/40">
		<button 
			type="button"
			onclick={decrement}
			disabled={value <= min}
			aria-label="Decrease {label || 'value'}"
			title="Decrease {label || 'value'}"
			class="w-10 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all"
		>
			<MinusIcon class="h-4 w-4" />
		</button>

		<div class="flex-1 min-w-[3.5rem] px-2">
			<input 
				type="number"
				inputmode={decimals ? 'decimal' : 'numeric'}
				{value}
				{min}
				{max}
				oninput={handleInput}
				onfocus={handleFocus}
				class="w-full bg-inherit border-0 text-center text-xs font-semibold text-secondary tracking-wide tabular-nums outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
			/>
		</div>

		<button 
			type="button"
			onclick={increment}
			disabled={value >= max}
			aria-label="Increase {label || 'value'}"
			title="Increase {label || 'value'}"
			class="w-10 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all"
		>
			<PlusIcon class="h-4 w-4" />
		</button>
	</div>
</div>
