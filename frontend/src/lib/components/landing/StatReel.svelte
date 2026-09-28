<script lang="ts">
	import Icon from './Icon.svelte';
	import { calm } from './utils';

	let {
		value,
		label,
		icon,
		index = 0
	}: { value: string; label: string; icon: string; index?: number } = $props();

	let host = $state<HTMLElement>();
	let rolled = $state(false);

	const chars = $derived([...value]);
	const isDigit = (char: string) => char >= '0' && char <= '9';
	const offset = (char: string) => `translateY(calc(${10 + Number(char)} * -1em))`;

	$effect(() => {
		if (!host) return;
		if (calm()) {
			rolled = true;
			return;
		}

		const seen = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				rolled = true;
				seen.disconnect();
			},
			{ threshold: 0.6 }
		);
		seen.observe(host);
		return () => seen.disconnect();
	});
</script>

<div bind:this={host} class="grid grid-cols-[2.75rem_1fr] content-start gap-x-3">
	<span
		class="bg-primary/10 text-primary col-start-1 row-span-2 row-start-1 grid size-11 place-items-center self-start rounded-xl"
		aria-hidden="true"
	>
		<Icon path={icon} class="size-5" />
	</span>

	<dt
		class="col-start-2 row-start-1 flex text-4xl leading-none font-semibold tracking-tight tabular-nums sm:text-5xl"
	>
		<span class="sr-only">{value}</span>

		{#each chars as char, i (i)}
			{#if isDigit(char)}
				<span class="inline-block h-[1em] overflow-hidden leading-none" aria-hidden="true">
					<span
						class="flex flex-col transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] *:h-[1em] *:leading-none motion-reduce:transition-none"
						style="transform: {rolled ? offset(char) : 'translateY(0)'}; transition-delay: {index *
							120 +
							i * 70}ms"
					>
						{#each { length: 20 } as _, n (n)}
							<span>{n % 10}</span>
						{/each}
					</span>
				</span>
			{:else}
				<span class="inline-block h-[1em] leading-none" aria-hidden="true">{char}</span>
			{/if}
		{/each}
	</dt>

	<dd class="text-muted-foreground col-start-2 row-start-2 mt-2 text-sm leading-relaxed">
		{label}
	</dd>
</div>
