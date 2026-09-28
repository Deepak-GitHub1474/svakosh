<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { calm } from './utils';

	let { text, class: className = '' }: { text: string; class?: string } = $props();

	type Spark = { id: number; x: number; y: number; dx: number; dy: number; size: number };

	const WRITE_MS = 2600;
	const GLOW =
		'radial-gradient(circle 13rem at var(--mx, -999px) var(--my, -999px), color-mix(in oklab, var(--primary) 92%, white) 0%, var(--success) 42%, transparent 68%)';
	const WRITE =
		'radial-gradient(circle 6rem at var(--sweep, -999px) 55%, white 0%, color-mix(in oklab, var(--primary) 90%, white) 35%, transparent 70%), linear-gradient(to right, color-mix(in oklab, var(--primary) 55%, transparent) 0 var(--sweep, 0px), transparent var(--sweep, 0px))';
	const HALO = 'drop-shadow(0 0 26px color-mix(in oklab, var(--primary) 45%, transparent))';

	let mark = $state<HTMLElement>();
	let sparks = $state<Spark[]>([]);
	let writing = $state(false);
	let seq = 0;
	let lastSpawn = 0;

	function spawn(x: number, y: number, spread: number) {
		const spark: Spark = {
			id: ++seq,
			x,
			y,
			dx: (Math.random() - 0.5) * spread,
			dy: -20 - Math.random() * 70,
			size: 2 + Math.random() * 4
		};
		sparks = [...sparks.slice(-40), spark];
		setTimeout(() => (sparks = sparks.filter((item) => item.id !== spark.id)), 1100);
	}

	function trace(event: PointerEvent) {
		if (!mark || writing) return;
		const box = mark.getBoundingClientRect();
		const x = event.clientX - box.left;
		const y = event.clientY - box.top;
		mark.style.setProperty('--mx', `${x}px`);
		mark.style.setProperty('--my', `${y}px`);

		if (calm()) return;
		const now = performance.now();
		if (now - lastSpawn < 45) return;
		lastSpawn = now;
		spawn(x, y, 70);
	}

	$effect(() => {
		if (!mark || calm()) return;
		const target = mark;

		let frame = 0;
		const write = () => {
			writing = true;
			const box = target.getBoundingClientRect();
			const start = performance.now();

			const step = (now: number) => {
				const progress = Math.min(1, (now - start) / WRITE_MS);
				const eased = progress * progress * (3 - 2 * progress);
				const x = eased * box.width;
				target.style.setProperty('--sweep', `${x}px`);

				if (now - lastSpawn > 26) {
					lastSpawn = now;
					spawn(x, box.height * (0.45 + Math.random() * 0.25), 40);
				}
				if (progress < 1) frame = requestAnimationFrame(step);
				else writing = false;
			};
			frame = requestAnimationFrame(step);
		};

		const seen = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				seen.disconnect();
				write();
			},
			{ threshold: 0.4 }
		);
		seen.observe(target);

		return () => {
			seen.disconnect();
			cancelAnimationFrame(frame);
		};
	});
</script>

<div
	bind:this={mark}
	class={cn('group text-foreground/7 relative cursor-default pb-[0.14em]', className)}
	aria-hidden="true"
	onpointermove={trace}
	onpointerleave={() => (sparks = [])}
>
	<span class="block">{text}</span>

	<span
		class="absolute inset-0 bg-clip-text text-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:hidden"
		style="background-image: {GLOW}; filter: {HALO}"
	>
		{text}
	</span>

	<span
		class={cn(
			'absolute inset-0 bg-clip-text text-transparent motion-reduce:hidden',
			writing ? 'opacity-100' : 'opacity-0 transition-opacity duration-900'
		)}
		style="background-image: {WRITE}; filter: {HALO}"
	>
		{text}
	</span>

	{#each sparks as spark (spark.id)}
		<span
			class="animate-drift bg-primary pointer-events-none absolute rounded-full shadow-[0_0_10px_var(--success)]"
			style="left: {spark.x}px; top: {spark.y}px; width: {spark.size}px; height: {spark.size}px;
				margin: {spark.size / -2}px; --dx: {spark.dx}px; --dy: {spark.dy}px"
		></span>
	{/each}
</div>
