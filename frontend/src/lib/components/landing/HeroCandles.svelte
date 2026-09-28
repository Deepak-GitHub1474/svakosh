<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { calm } from './utils';

	let { class: className = '' }: { class?: string } = $props();

	type Candle = { o: number; h: number; l: number; c: number };

	const COUNT = 48;
	const W = 1200;
	const H = 600;
	const TOP = 140;
	const BASE = 548;
	const SLOT = W / COUNT;

	let seed = 20260928;
	const rand = () => {
		seed ^= seed << 13;
		seed ^= seed >>> 17;
		seed ^= seed << 5;
		return (seed >>>= 0) / 4294967296;
	};

	const OPEN = 24700;
	const TREND = 3.4;
	let step = 0;

	function next(from: number): Candle {
		step++;
		const pull = (OPEN + step * TREND - from) * 0.22;
		const size = (0.3 + rand() * 1.5) * 30;
		const close = from + pull + (rand() < 0.68 ? size : -size);
		return {
			o: from,
			c: close,
			h: Math.max(from, close) + rand() * size * 0.7,
			l: Math.min(from, close) - rand() * size * 0.7
		};
	}

	function series() {
		const out: Candle[] = [];
		let last = OPEN;
		for (let i = 0; i < COUNT; i++) {
			const candle = next(last);
			out.push(candle);
			last = candle.c;
		}
		return out;
	}

	let candles = $state<Candle[]>(series());
	let host = $state<SVGSVGElement>();

	const scale = $derived.by(() => {
		const high = Math.max(...candles.map((candle) => candle.h));
		const low = Math.min(...candles.map((candle) => candle.l));
		const pad = (high - low) * 0.1 || 1;
		return { high: high + pad, low: low - pad };
	});

	const y = (value: number) =>
		BASE - ((value - scale.low) / (scale.high - scale.low)) * (BASE - TOP);

	$effect(() => {
		if (!host || calm()) return;

		let timer = 0;
		let tick = 0;

		const step = () => {
			tick++;
			const list = candles.slice();
			const live = { ...list[list.length - 1] };
			const close = live.c + (rand() - 0.45) * 26;
			live.c = close;
			live.h = Math.max(live.h, close);
			live.l = Math.min(live.l, close);
			list[list.length - 1] = live;

			if (tick % 5 === 0) {
				list.shift();
				list.push(next(close));
			}
			candles = list;
		};

		const wide = matchMedia('(min-width: 768px)');
		let visible = false;

		const stop = () => {
			clearInterval(timer);
			timer = 0;
		};
		const sync = () => {
			if (visible && wide.matches) {
				if (!timer) timer = window.setInterval(step, 300);
			} else {
				stop();
			}
		};

		const seen = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			sync();
		});
		seen.observe(host);
		wide.addEventListener('change', sync);

		return () => {
			stop();
			seen.disconnect();
			wide.removeEventListener('change', sync);
		};
	});
</script>

<div class={cn('pointer-events-none overflow-hidden', className)} aria-hidden="true">
	<svg
		bind:this={host}
		class="h-full w-full"
		viewBox="0 0 {W} {H}"
		preserveAspectRatio="xMidYMid slice"
		fill="none"
	>
		<defs>
			<pattern id="hero-grid" width="80" height="80" patternUnits="userSpaceOnUse">
				<path d="M80 0H0v80" stroke="currentColor" stroke-width="1" class="text-white/[0.035]" />
			</pattern>

			<radialGradient id="hero-gold" cx="18%" cy="4%" r="62%">
				<stop offset="0%" stop-color="var(--primary)" stop-opacity="0.2" />
				<stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
			</radialGradient>

			<radialGradient id="hero-cool" cx="88%" cy="16%" r="54%">
				<stop offset="0%" stop-color="var(--success)" stop-opacity="0.1" />
				<stop offset="100%" stop-color="var(--success)" stop-opacity="0" />
			</radialGradient>

			<linearGradient id="hero-grid-fade" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#fff" stop-opacity="0.8" />
				<stop offset="70%" stop-color="#fff" stop-opacity="0.5" />
				<stop offset="100%" stop-color="#fff" stop-opacity="0" />
			</linearGradient>

			<linearGradient id="hero-candle-fade" x1="0" y1="0" x2="1" y2="0.3">
				<stop offset="0%" stop-color="#000" />
				<stop offset="42%" stop-color="#000" />
				<stop offset="66%" stop-color="#8f8f8f" />
				<stop offset="90%" stop-color="#fff" />
			</linearGradient>

			<mask id="hero-grid-mask">
				<rect width={W} height={H} fill="url(#hero-grid-fade)" />
			</mask>

			<mask id="hero-candle-mask">
				<rect width={W} height={H} fill="url(#hero-candle-fade)" />
			</mask>
		</defs>

		<g mask="url(#hero-grid-mask)">
			<rect width={W} height={H} fill="url(#hero-grid)" />
			<line
				x1="0"
				y1={BASE}
				x2={W}
				y2={BASE}
				stroke="currentColor"
				stroke-width="1"
				class="text-white/[0.07]"
			/>
		</g>

		<g mask="url(#hero-candle-mask)" opacity="0.3">
			{#each candles as candle, i (i)}
				{@const cx = i * SLOT + SLOT / 2}
				{@const tone = candle.c >= candle.o ? 'var(--success)' : 'var(--error)'}
				<line x1={cx} x2={cx} y1={y(candle.h)} y2={y(candle.l)} stroke={tone} stroke-width="1" />
				<rect
					x={cx - SLOT * 0.16}
					y={y(Math.max(candle.o, candle.c))}
					width={SLOT * 0.32}
					height={Math.max(1, Math.abs(y(candle.o) - y(candle.c)))}
					fill={tone}
					rx="1"
				/>
			{/each}

			<line
				x1="0"
				y1={y(candles[candles.length - 1].c)}
				x2={W}
				y2={y(candles[candles.length - 1].c)}
				stroke="var(--primary)"
				stroke-width="1"
				stroke-dasharray="6 8"
				opacity="0.55"
			/>
		</g>

		<rect width={W} height={H} fill="url(#hero-gold)" />
		<rect width={W} height={H} fill="url(#hero-cool)" />
	</svg>
</div>
