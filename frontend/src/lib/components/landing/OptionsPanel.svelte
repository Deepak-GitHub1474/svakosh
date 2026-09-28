<script lang="ts">
	import Icon from './Icon.svelte';
	import Panel from './Panel.svelte';
	import { OPTIONS } from './data';

	const W = 900;
	const H = 260;
	const TOP = 18;
	const ZERO = 210;
	const SLOT = W / OPTIONS.strikes.length;

	const peak = 8;
	const y = (value: number) => ZERO - (value / peak) * (ZERO - TOP);
	const painIndex = OPTIONS.strikes.findIndex((s) => s.strike === OPTIONS.maxPain);
	const painX = painIndex * SLOT + SLOT / 2;

	const curve = (key: 'ceC' | 'peC') =>
		OPTIONS.strikes
			.map((s, i) => `${(i * SLOT + SLOT / 2).toFixed(1)},${y(s[key]).toFixed(1)}`)
			.join('L');

	const tone = (t: string) =>
		t === 'up'
			? 'text-bullish'
			: t === 'down'
				? 'text-bearish'
				: t === 'primary'
					? 'text-primary'
					: '';
</script>

<Panel
	title="Options Analytics"
	subtitle="Advanced Open Interest and Strike Analysis"
	chips={[OPTIONS.symbol, OPTIONS.expiry]}
>
	<dl class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
		{#each OPTIONS.stats as stat (stat.label)}
			<div
				class="border-border-subtle bg-background/60 relative overflow-hidden rounded-lg border px-3 py-2"
			>
				<Icon path={stat.icon} class="text-foreground/5 absolute -right-1 bottom-0 size-9" />
				<dt class="text-muted-foreground relative text-[0.625rem] tracking-[0.12em] uppercase">
					{stat.label}
				</dt>
				<dd class="relative mt-0.5 text-sm font-medium tabular-nums {tone(stat.tone)}">
					{stat.value}
					{#if stat.note}<span class="text-muted-foreground text-[0.625rem]">{stat.note}</span>{/if}
				</dd>
			</div>
		{/each}
	</dl>

	<div class="border-border-subtle bg-background/40 mt-3 rounded-lg border p-4">
		<p class="flex items-center gap-2 text-sm">
			<span class="bg-primary h-3.5 w-0.5 shrink-0" aria-hidden="true"></span>
			Open Interest Distribution
		</p>
		<p class="text-muted-foreground mt-0.5 ml-3.5 text-[0.6875rem]">
			Multi-Strike Analysis for {OPTIONS.expiry}
		</p>

		<div class="mt-3 flex gap-2">
			<ul
				class="text-muted-foreground flex h-36 shrink-0 flex-col justify-between text-[0.5625rem] tabular-nums"
			>
				{#each [8, 6, 4, 2, 0] as mark (mark)}
					<li>{mark}</li>
				{/each}
			</ul>

			<svg
				viewBox="0 0 {W} {H}"
				preserveAspectRatio="none"
				class="h-36 w-full"
				role="img"
				aria-label="Open interest by strike with max pain at {OPTIONS.maxPain}"
			>
				{#each [8, 6, 4, 2, 0] as mark (mark)}
					<line
						x1="0"
						x2={W}
						y1={y(mark)}
						y2={y(mark)}
						stroke="currentColor"
						stroke-width="1"
						stroke-dasharray="3 4"
						vector-effect="non-scaling-stroke"
						class="text-white/[0.07]"
					/>
				{/each}

				{#each OPTIONS.strikes as row, i (row.strike)}
					{@const x = i * SLOT}
					<rect
						x={x + SLOT * 0.2}
						y={y(row.ce)}
						width={SLOT * 0.22}
						height={ZERO - y(row.ce)}
						fill="var(--bearish)"
					/>
					<rect
						x={x + SLOT * 0.52}
						y={y(row.pe)}
						width={SLOT * 0.22}
						height={ZERO - y(row.pe)}
						fill="var(--bullish)"
					/>
				{/each}

				<path
					d="M{curve('ceC')}"
					fill="none"
					stroke="var(--bearish)"
					stroke-width="1"
					stroke-dasharray="4 4"
					vector-effect="non-scaling-stroke"
					opacity="0.7"
				/>
				<path
					d="M{curve('peC')}"
					fill="none"
					stroke="var(--bullish)"
					stroke-width="1"
					stroke-dasharray="4 4"
					vector-effect="non-scaling-stroke"
					opacity="0.7"
				/>

				<line
					x1={painX}
					x2={painX}
					y1="0"
					y2={H}
					stroke="currentColor"
					stroke-width="1"
					stroke-dasharray="4 4"
					vector-effect="non-scaling-stroke"
					class="text-white/40"
				/>
			</svg>
		</div>

		<div class="mt-1 ml-5 flex justify-between">
			{#each OPTIONS.strikes as row, i (row.strike)}
				<span
					class="origin-top-left -rotate-45 text-[0.5625rem] tabular-nums {row.strike ===
					OPTIONS.maxPain
						? 'text-foreground'
						: 'text-muted-foreground'}"
				>
					{row.strike}
				</span>
			{/each}
		</div>

		<ul
			class="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[0.6875rem]"
		>
			<li class="flex items-center gap-1.5">
				<span class="bg-bearish h-2.5 w-4 rounded-xs" aria-hidden="true"></span> CE OI
			</li>
			<li class="flex items-center gap-1.5">
				<span class="bg-bullish h-2.5 w-4 rounded-xs" aria-hidden="true"></span> PE OI
			</li>
			<li class="flex items-center gap-1.5">
				<span class="bg-bearish size-2 rounded-full" aria-hidden="true"></span> CE Change
			</li>
			<li class="flex items-center gap-1.5">
				<span class="bg-bullish size-2 rounded-full" aria-hidden="true"></span> PE Change
			</li>
		</ul>
	</div>

	<div class="mt-2 grid gap-2 lg:grid-cols-2">
		{#each [{ heading: 'Top OI buildup', rows: OPTIONS.buildup, tone: 'text-bullish' }, { heading: 'Significant unwinding', rows: OPTIONS.unwinding, tone: 'text-bearish' }] as group (group.heading)}
			<div class="border-border-subtle bg-background/40 rounded-lg border p-3">
				<p class="text-[0.625rem] tracking-[0.12em] uppercase {group.tone}">{group.heading}</p>
				<table class="mt-2 min-w-full">
					<thead>
						<tr class="border-border-subtle text-muted-foreground border-b text-[0.5625rem]">
							<th class="pb-1 text-left font-normal">Strike</th>
							<th class="pb-1 text-right font-normal">CE Change</th>
							<th class="pb-1 text-right font-normal">PE Change</th>
							<th class="pb-1 text-right font-normal">Net Chg</th>
						</tr>
					</thead>
					<tbody>
						{#each group.rows as row (row.strike)}
							<tr class="border-border-subtle/50 border-b last:border-0">
								<td class="py-1 text-[0.625rem] tabular-nums">{row.strike}</td>
								<td
									class="py-1 text-right text-[0.625rem] tabular-nums {row.ce >= 0
										? 'text-bearish'
										: 'text-bearish'}">{row.ce >= 0 ? '+' : ''}{row.ce.toFixed(2)}L</td
								>
								<td
									class="py-1 text-right text-[0.625rem] tabular-nums {row.pe >= 0
										? 'text-bullish'
										: 'text-bearish'}">{row.pe >= 0 ? '+' : ''}{row.pe.toFixed(2)}L</td
								>
								<td
									class="py-1 text-right text-[0.625rem] tabular-nums {row.net >= 0
										? 'text-bullish'
										: 'text-bearish'}">{row.net >= 0 ? '+' : ''}{row.net.toFixed(2)}L</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/each}
	</div>
</Panel>
