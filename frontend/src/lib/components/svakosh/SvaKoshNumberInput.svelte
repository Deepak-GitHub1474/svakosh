<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		value: number;
		label?: string;
		min?: number;
		max?: number;
		step?: number;
		class?: string;
	};

	let { 
		value = $bindable(), 
		label, 
		min = 0, 
		max = 100, 
		step = 1,
		class: className = '' 
	}: Props = $props();

	function increment() {
		if (value + step <= max) value += step;
	}

	function decrement() {
		if (value - step >= min) value -= step;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const val = parseInt(target.value);
		if (!isNaN(val)) {
			if (val < min) value = min;
			else if (val > max) value = max;
			else value = val;
		}
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
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
			</svg>
		</button>

		<div class="flex-1 min-w-[3.5rem] px-2">
			<input 
				type="number"
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
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>
</div>
