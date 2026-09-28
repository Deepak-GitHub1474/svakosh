<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import Icon from './Icon.svelte';

	type Item = { title: string; lead: string; body: string; route: string; icon: string };

	let { items, class: className = '' }: { items: readonly Item[]; class?: string } = $props();

	const CAPSULE = 56;
	const GAP = 8;
	const SLOT = CAPSULE + GAP;
	const STEP = 120;
	const SPAN = 1;
	const COOLDOWN = 420;
	const THRESHOLD = 22;

	let shell = $state<HTMLElement>();
	let active = $state(0);
	let heights = $state<number[]>([]);

	const ready = $derived(heights.length === items.length);
	const tallest = $derived(ready ? Math.max(...heights) : 0);

	const above = $derived(Math.min(active, SPAN));
	const below = $derived(Math.min(items.length - 1 - active, SPAN));

	const shellHeight = $derived((heights[active] ?? tallest) + (above + below) * SLOT);
	const railHeight = $derived(shellHeight + (items.length - 1) * STEP);

	const shown = (i: number) => (i === active ? heights[i] : CAPSULE);
	const rank = (i: number) => Math.max(-SPAN, Math.min(SPAN, i - active));

	function offset(i: number) {
		const distance = rank(i);
		const top = above * SLOT;
		return distance <= 0 ? top + distance * SLOT : top + shown(active) + GAP;
	}

	function go(i: number) {
		shell?.scrollTo({ top: i * STEP, behavior: 'smooth' });
	}

	$effect(() => {
		const node = shell;
		if (!node) return;

		const mq = matchMedia('(max-width: 767px)');
		let frame = 0;

		const follow = () => {
			frame = 0;
			active = Math.max(0, Math.min(items.length - 1, Math.round(node.scrollTop / STEP)));
		};

		const onscroll = () => {
			if (!frame) frame = requestAnimationFrame(follow);
		};

		let stepped = 0;
		const count = items.length;

		const step = (dir: number) => {
			const next = active + dir;
			if (next < 0 || next >= count) return;
			const now = performance.now();
			if (now - stepped < COOLDOWN) return;
			stepped = now;
			node.scrollTo({ top: next * STEP, behavior: 'smooth' });
		};

		const onwheel = (event: WheelEvent) => {
			const dir = Math.sign(event.deltaY);
			if (!dir || active + dir < 0 || active + dir >= count) return;
			event.preventDefault();
			step(dir);
		};

		let startY = 0;
		let held = false;
		let handed = false;

		const ontouchstart = (event: TouchEvent) => {
			startY = event.touches[0].clientY;
			held = false;
			handed = false;
		};

		const ontouchmove = (event: TouchEvent) => {
			if (handed) return;
			if (held) {
				event.preventDefault();
				return;
			}
			const dy = startY - event.touches[0].clientY;
			const dir = Math.sign(dy);
			if (Math.abs(dy) < THRESHOLD) return;
			if (active + dir < 0 || active + dir >= count) {
				handed = true;
				return;
			}
			event.preventDefault();
			held = true;
			step(dir);
		};

		const fit = () => {
			const next = [...node.querySelectorAll('article')].map((el) => el.offsetHeight);
			if (next.length === heights.length && next.every((h, i) => h === heights[i])) return;
			heights = next;
		};

		const start = () => {
			node.removeEventListener('scroll', onscroll);
			node.removeEventListener('wheel', onwheel);
			node.removeEventListener('touchstart', ontouchstart);
			node.removeEventListener('touchmove', ontouchmove);
			if (!mq.matches) {
				heights = [];
				return;
			}
			fit();
			node.addEventListener('scroll', onscroll, { passive: true });
			node.addEventListener('wheel', onwheel, { passive: false });
			node.addEventListener('touchstart', ontouchstart, { passive: true });
			node.addEventListener('touchmove', ontouchmove, { passive: false });
		};

		const observer = new ResizeObserver(() => fit());
		for (const card of node.querySelectorAll('article')) observer.observe(card);

		start();
		document.fonts?.ready.then(fit);
		mq.addEventListener('change', start);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			node.removeEventListener('scroll', onscroll);
			node.removeEventListener('wheel', onwheel);
			node.removeEventListener('touchstart', ontouchstart);
			node.removeEventListener('touchmove', ontouchmove);
			mq.removeEventListener('change', start);
		};
	});
</script>

<div
	bind:this={shell}
	class={cn('hide-scrollbar', ready && 'snap-y snap-mandatory overflow-y-auto', className)}
	style={ready ? `height: ${shellHeight}px` : undefined}
>
	<div class="relative" style={ready ? `height: ${railHeight}px` : undefined}>
		{#if ready}
			{#each items as _, i (i)}
				<div
					class="absolute left-0 size-px snap-start snap-always"
					style="top: {i * STEP}px"
					aria-hidden="true"
				></div>
			{/each}
		{/if}

		<div
			class={cn('grid gap-2', ready && 'sticky top-0 block overflow-hidden')}
			style={ready ? `height: ${shellHeight}px` : undefined}
		>
			{#each items as item, i (item.title)}
				{@const on = i === active}
				<article
					class={cn(
						'border-border-muted bg-surface/40 origin-top overflow-hidden rounded-2xl border',
						'transition-[transform,clip-path,opacity] duration-[620ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
						ready && 'absolute inset-x-0 top-0'
					)}
					style={ready
						? `transform: translate3d(0, ${offset(i)}px, 0) scale(${1 - Math.abs(rank(i)) * 0.04});
							clip-path: inset(0 0 ${heights[i] - shown(i)}px 0 round 1rem);
							z-index: ${10 - Math.abs(rank(i))};
							opacity: ${Math.abs(i - active) > SPAN ? 0 : 1}`
						: undefined}
					aria-current={ready ? on : undefined}
				>
					<span
						class={cn(
							'ghost-num pointer-events-none absolute top-1 right-3 px-1 text-[88px] leading-none font-bold text-transparent select-none',
							ready && 'transition-opacity duration-500',
							ready && !on ? 'opacity-0' : 'opacity-100 delay-200'
						)}
						aria-hidden="true"
					>
						{i + 1}
					</span>

					<button
						type="button"
						onclick={() => go(i)}
						class="relative flex h-14 w-full items-center gap-3 px-5 text-left"
						aria-expanded={ready ? on : true}
					>
						<span
							class={cn(
								'grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-300',
								ready && !on
									? 'bg-background/60 text-muted-foreground'
									: 'bg-primary/15 text-primary'
							)}
							aria-hidden="true"
						>
							<Icon path={item.icon} class="size-4" />
						</span>
						<h3 class="truncate font-semibold tracking-tight">{item.title}</h3>
					</button>

					<div
						class={cn(
							'relative px-5 pb-5',
							ready && 'transition-opacity duration-500',
							ready && !on ? 'opacity-0' : 'opacity-100 delay-200'
						)}
						aria-hidden={ready ? !on : undefined}
					>
						<p class="leading-relaxed">{item.lead}</p>
						<p class="text-muted-foreground mt-2 leading-relaxed">{item.body}</p>
						<p
							class="border-border-subtle text-muted-foreground mt-4 flex min-w-0 items-center gap-2 border-t pt-3 text-xs"
						>
							<span class="text-primary shrink-0">→</span>
							<span class="min-w-0 truncate">{item.route}</span>
						</p>
					</div>
				</article>
			{/each}
		</div>
	</div>
</div>
