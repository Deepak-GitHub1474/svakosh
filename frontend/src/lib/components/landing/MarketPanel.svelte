<script lang="ts">
	import Panel from './Panel.svelte';
	import { MARKET } from './data';

	const { advances, declines, unchanged } = MARKET.breadth;
	const total = advances + declines + unchanged;
	const R = 46;
	const C = 2 * Math.PI * R;
	const arc = (value: number) => (value / total) * C;

	const W = 560;
	const H = 170;
	const low = Math.min(...MARKET.intraday);
	const high = Math.max(...MARKET.intraday);
	const step = W / (MARKET.intraday.length - 1);
	const py = (v: number) => H - 14 - ((v - low) / (high - low)) * (H - 34);
	const points = MARKET.intraday.map((v, i) => `${(i * step).toFixed(1)},${py(v).toFixed(1)}`);
	const line = `M${points.join('L')}`;
	const area = `${line}L${W},${H}L0,${H}Z`;

	const widest = Math.max(...MARKET.sectors.map((s) => Math.abs(s.v)));
</script>

<Panel
	title="Market Intelligence"
	subtitle="Indian Stock Market Overview & Analytics"
	chips={['NIFTY 50']}
>
	<dl class="grid gap-2 sm:grid-cols-3">
		{#each MARKET.indices as index (index.name)}
			<div class="border-border-subtle bg-background/60 rounded-lg border px-3 py-2">
				<dt class="text-muted-foreground text-[0.625rem] tracking-[0.12em] uppercase">
					{index.name}
				</dt>
				<dd class="mt-0.5 text-sm font-medium tabular-nums">
					{index.value}
					<span class="ml-1 text-[0.625rem] {index.up ? 'text-bullish' : 'text-bearish'}">
						{index.change}
					</span>
				</dd>
			</div>
		{/each}
	</dl>

	<div class="mt-2 grid gap-2 lg:grid-cols-[1.5fr_1fr]">
		<div class="border-border-subtle bg-background/40 rounded-lg border p-3">
			<p class="flex items-center gap-2 text-xs">
				<span class="bg-primary h-3 w-0.5 shrink-0" aria-hidden="true"></span> Market Intraday
			</p>

			<svg
				viewBox="0 0 {W} {H}"
				preserveAspectRatio="none"
				class="mt-2 h-28 w-full"
				role="img"
				aria-label="NIFTY 50 intraday price"
			>
				<defs>
					<linearGradient id="intraday-fill" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="var(--primary)" stop-opacity="0.22" />
						<stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
					</linearGradient>
				</defs>
				{#each [0.25, 0.5, 0.75] as g (g)}
					<line
						x1="0"
						x2={W}
						y1={H * g}
						y2={H * g}
						stroke="currentColor"
						stroke-width="1"
						stroke-dasharray="3 4"
						vector-effect="non-scaling-stroke"
						class="text-white/[0.06]"
					/>
				{/each}
				<path d={area} fill="url(#intraday-fill)" />
				<path
					d={line}
					fill="none"
					stroke="var(--primary)"
					stroke-width="1.5"
					stroke-linejoin="round"
					vector-effect="non-scaling-stroke"
				/>
			</svg>

			<ul class="text-muted-foreground mt-1 flex justify-between text-[0.5625rem] tabular-nums">
				{#each MARKET.times as time (time)}
					<li>{time}</li>
				{/each}
			</ul>
		</div>

		<div class="border-border-subtle bg-background/40 rounded-lg border p-3">
			<p class="flex items-center gap-2 text-xs">
				<span class="bg-primary h-3 w-0.5 shrink-0" aria-hidden="true"></span> Market Breadth
			</p>

			<div class="mt-2 flex items-center gap-3">
				<svg viewBox="0 0 120 120" class="size-24 shrink-0" role="img" aria-label="Market breadth">
					<circle cx="60" cy="60" r={R} fill="none" stroke="var(--surface)" stroke-width="16" />
					<circle
						cx="60"
						cy="60"
						r={R}
						fill="none"
						stroke="var(--bullish)"
						stroke-width="16"
						stroke-dasharray="{arc(advances)} {C}"
						transform="rotate(-90 60 60)"
					/>
					<circle
						cx="60"
						cy="60"
						r={R}
						fill="none"
						stroke="var(--bearish)"
						stroke-width="16"
						stroke-dasharray="{arc(declines)} {C}"
						stroke-dashoffset={-arc(advances)}
						transform="rotate(-90 60 60)"
					/>
				</svg>

				<ul class="text-muted-foreground space-y-1.5 text-[0.625rem]">
					<li class="flex items-center gap-1.5">
						<span class="bg-bullish size-1.5 rounded-full" aria-hidden="true"></span> Advances
					</li>
					<li class="flex items-center gap-1.5">
						<span class="bg-bearish size-1.5 rounded-full" aria-hidden="true"></span> Declines
					</li>
					<li class="flex items-center gap-1.5">
						<span class="bg-muted-foreground size-1.5 rounded-full" aria-hidden="true"></span>
						Unchanged
					</li>
				</ul>
			</div>

			<dl class="mt-3 grid grid-cols-3 gap-1.5">
				{#each [{ l: 'Advances', v: advances, c: 'text-bullish' }, { l: 'Declines', v: declines, c: 'text-bearish' }, { l: 'Unchanged', v: unchanged, c: '' }] as item (item.l)}
					<div class="border-border-subtle bg-background/60 rounded-md border px-2 py-1.5">
						<dt class="text-muted-foreground text-[0.5625rem] tracking-wide uppercase">{item.l}</dt>
						<dd class="text-xs tabular-nums {item.c}">{item.v}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</div>

	<div class="mt-2 grid gap-2 lg:grid-cols-2">
		<div class="border-border-subtle bg-background/40 rounded-lg border p-3">
			<p class="flex items-center gap-2 text-xs">
				<span class="bg-primary h-3 w-0.5 shrink-0" aria-hidden="true"></span> Sectoral Performance
			</p>
			<ul class="mt-2.5 space-y-1.5">
				{#each MARKET.sectors as sector (sector.name)}
					<li class="grid grid-cols-[3.25rem_1fr] items-center gap-2">
						<span class="text-muted-foreground text-right text-[0.5625rem]">{sector.name}</span>
						<span class="flex h-2 items-center">
							<span
								class="h-full rounded-xs {sector.v >= 0 ? 'bg-bullish/80' : 'bg-bearish/80'}"
								style="width: {(Math.abs(sector.v) / widest) * 100}%"
							></span>
						</span>
					</li>
				{/each}
			</ul>
		</div>

		<div class="border-border-subtle bg-background/40 rounded-lg border p-3">
			<p class="flex items-center gap-2 text-xs">
				<span class="bg-primary h-3 w-0.5 shrink-0" aria-hidden="true"></span> Top Movers
			</p>
			<table class="mt-2 min-w-full">
				<thead>
					<tr
						class="border-border-subtle text-muted-foreground border-b text-left text-[0.5625rem]"
					>
						<th class="pb-1.5 font-normal">Symbol</th>
						<th class="pb-1.5 text-right font-normal">LTP</th>
						<th class="pb-1.5 text-right font-normal">Change</th>
						<th class="pb-1.5 text-right font-normal">Chg%</th>
					</tr>
				</thead>
				<tbody>
					{#each MARKET.movers as mover (mover.symbol)}
						<tr class="border-border-subtle/50 border-b last:border-0">
							<td class="py-1.5 text-[0.625rem]">{mover.symbol}</td>
							<td class="py-1.5 text-right text-[0.625rem] tabular-nums">{mover.ltp}</td>
							<td class="text-bullish py-1.5 text-right text-[0.625rem] tabular-nums">
								{mover.change}
							</td>
							<td class="text-bullish py-1.5 text-right text-[0.625rem] tabular-nums">
								+{mover.pct.toFixed(2)}%
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</Panel>
