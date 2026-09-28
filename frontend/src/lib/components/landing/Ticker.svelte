<script lang="ts">
	import { TICKERS } from './data';

	const loop = [...TICKERS, ...TICKERS];

	let open = $state(true);
</script>

<div class="relative z-20">
	<div
		class="bg-surface border-border-subtle overflow-hidden border-b transition-[height,opacity] duration-[400ms] ease-out motion-reduce:transition-none"
		style="height: {open ? '3.5rem' : '0'}; opacity: {open ? 1 : 0}"
		aria-hidden={!open}
	>
		<div class="animate-marquee flex h-full w-max items-center motion-reduce:animate-none">
			{#each loop as item, i (i)}
				<span
					class="border-border-subtle flex shrink-0 items-baseline gap-2 border-l px-7 text-xs tabular-nums"
				>
					<span class="text-muted-foreground">{item.symbol}</span>
					<span>{item.price}</span>
					<span class={item.change >= 0 ? 'text-success' : 'text-error'}>
						{item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
					</span>
				</span>
			{/each}
		</div>
	</div>

	<button
		type="button"
		onclick={() => (open = !open)}
		aria-expanded={open}
		aria-label={open ? 'Hide market tape' : 'Show market tape'}
		class="text-primary group absolute top-full left-1/2 grid size-8 -translate-x-1/2 place-items-center"
	>
		<span
			class="bg-primary/40 group-hover:bg-primary/75 absolute size-7 animate-pulse rounded-full blur-[7px] transition-all duration-300 group-hover:blur-[10px] motion-reduce:animate-none"
			aria-hidden="true"
		></span>
		<svg
			viewBox="0 0 24 24"
			class="relative size-4 text-[#fbf0cd] drop-shadow-[0_0_5px_var(--primary)] transition-transform duration-300 group-hover:drop-shadow-[0_0_9px_var(--primary)] motion-reduce:transition-none"
			style="transform: rotate({open ? 180 : 0}deg)"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 15.5 5.5 9h13z" />
		</svg>
	</button>
</div>
