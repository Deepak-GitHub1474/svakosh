<script lang="ts">
	import { MAX_STRIKE_RANGE, MIN_STRIKE_RANGE } from '../_lib/const';
	import { chain, setRange } from '../_lib/state.svelte';

	let draftRange = $state(chain.range);

	$effect(() => {
		draftRange = chain.range;
	});

	function commit() {
		setRange(draftRange);
		draftRange = chain.range;
	}
</script>

<div
	class="border-border-subtle bg-background/60 flex w-full items-center justify-between overflow-hidden rounded-lg border md:w-auto md:justify-start"
>
	<button
		type="button"
		onclick={() => setRange(chain.range - 1)}
		disabled={chain.range <= MIN_STRIKE_RANGE}
		class="border-border-subtle bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-foreground inline-flex size-10 shrink-0 items-center justify-center border-r text-base disabled:opacity-30"
		aria-label="Fewer strikes"
	>
		−
	</button>

	<input
		type="number"
		min={MIN_STRIKE_RANGE}
		max={MAX_STRIKE_RANGE}
		bind:value={draftRange}
		onblur={commit}
		onkeydown={(event) => event.key === 'Enter' && commit()}
		class="w-12 [appearance:textfield] bg-transparent py-2 text-center text-sm tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		aria-label="Strikes each side of at-the-money"
	/>

	<button
		type="button"
		onclick={() => setRange(chain.range + 1)}
		disabled={chain.range >= MAX_STRIKE_RANGE}
		class="border-border-subtle bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-foreground inline-flex size-10 shrink-0 items-center justify-center border-l text-base disabled:opacity-30"
		aria-label="More strikes"
	>
		+
	</button>
</div>
