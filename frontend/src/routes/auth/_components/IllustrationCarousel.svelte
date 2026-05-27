<script lang="ts">
	import { cubicOut } from 'svelte/easing';

	type ImageItem = { src: string; alt: string };
	type Props = {
		images: ImageItem[];
		intervalMs?: number;
	};

	function softZoom(_node: Element, { duration = 900, from = 1.06 }: { duration?: number; from?: number } = {}) {
		return {
			duration,
			easing: cubicOut,
			css: (t: number) => {
				const scale = from + (1 - from) * t;
				return `opacity:${t}; transform:scale(${scale}); filter:blur(${(1 - t) * 4}px);`;
			}
		};
	}

	let { images, intervalMs = 5000 }: Props = $props();
	let current = $state(0);
	let paused = $state(false);
	let timer: ReturnType<typeof setInterval> | null = null;

	function stop() {
		if (timer !== null) {
			clearInterval(timer);
			timer = null;
		}
	}

	function start() {
		stop();
		if (paused || images.length <= 1) return;
		timer = setInterval(() => {
			current = (current + 1) % images.length;
		}, intervalMs);
	}

	function go(i: number) {
		const n = images.length;
		if (!n) return;
		current = ((i % n) + n) % n;
		start();
	}

	function next() {
		go(current + 1);
	}

	function prev() {
		go(current - 1);
	}

	function toggle() {
		paused = !paused;
		if (paused) stop();
		else start();
	}

	$effect(() => {
		start();
		return stop;
	});
</script>

{#if images.length}
	<div class="absolute inset-0 overflow-hidden">
		{#each images as img, i (i)}
			{#if i === current}
				<img
					src={img.src}
					alt={img.alt}
					loading={i === 0 ? 'eager' : 'lazy'}
					class="absolute inset-0 h-full w-full object-cover [object-position:54%_10%]"
					in:softZoom={{ duration: 900, from: 1.06 }}
					out:softZoom={{ duration: 700, from: 0.96 }}
				/>
			{/if}
		{/each}
	</div>

	<div class="absolute top-6 right-5 z-20 hidden items-center gap-2 lg:flex">
		{#each images as _, i (i)}
			<button
				type="button"
				onclick={() => go(i)}
				aria-label="Go to slide {i + 1}"
				class="h-2.5 rounded-full transition-all duration-500 ease-out {i === current
					? 'w-10 bg-primary shadow-[0_0_12px_rgba(195,178,152,0.7)]'
					: 'w-2.5 bg-white/30 hover:bg-white/60'}"
			></button>
		{/each}
	</div>

	<div class="absolute bottom-28 right-5 z-20 hidden items-center gap-3 lg:flex">
		<button
			type="button"
			onclick={prev}
			aria-label="Previous slide"
			class="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-white/15 to-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-lg transition-all hover:border-white/25 hover:from-white/25 hover:to-white/10"
		>
			<span class="material-symbols-outlined" style="font-size:22px">chevron_left</span>
		</button>
		<button
			type="button"
			onclick={toggle}
			aria-label={paused ? 'Play' : 'Pause'}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe066] via-[#ffd700] to-primary text-[#08090a] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_0_20px_rgba(255,215,0,0.7)] transition-transform hover:scale-105"
		>
			<span class="material-symbols-outlined" style="font-size:26px">
				{paused ? 'play_arrow' : 'pause'}
			</span>
		</button>
		<button
			type="button"
			onclick={next}
			aria-label="Next slide"
			class="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-white/15 to-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-lg transition-all hover:border-white/25 hover:from-white/25 hover:to-white/10"
		>
			<span class="material-symbols-outlined" style="font-size:22px">chevron_right</span>
		</button>
	</div>
{/if}
