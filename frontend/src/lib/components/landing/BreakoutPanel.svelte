<script lang="ts">
	import Icon from './Icon.svelte';
	import Panel from './Panel.svelte';
	import { BREAKOUT, ICONS } from './data';

	const tone = (t: string) => (t === 'up' ? 'text-bullish' : t === 'down' ? 'text-bearish' : '');
</script>

<Panel title="52-Week Breakout" subtitle="Detection of periodic stock price extremes">
	<dl class="grid grid-cols-3 gap-2">
		{#each BREAKOUT.stats as stat (stat.label)}
			<div
				class="border-border-subtle bg-background/60 relative overflow-hidden rounded-lg border px-3 py-2"
			>
				<Icon path={stat.icon} class="text-foreground/5 absolute -right-1 bottom-0 size-9" />
				<dt class="text-muted-foreground relative text-[0.625rem] tracking-[0.12em] uppercase">
					{stat.label}
				</dt>
				<dd class="relative mt-0.5 text-sm font-medium tabular-nums {tone(stat.tone)}">
					{stat.value}
				</dd>
			</div>
		{/each}
	</dl>

	<div
		class="border-border-subtle bg-background/60 text-muted-foreground mt-3 rounded-lg border px-3 py-2 text-xs"
	>
		Search by Symbol or Name…
	</div>

	<div class="mt-3 overflow-x-auto">
		<table class="min-w-full">
			<thead>
				<tr class="border-border-subtle text-muted-foreground border-b text-left text-[0.625rem]">
					<th class="pb-2 font-normal whitespace-nowrap">Time ▾</th>
					<th class="pb-2 font-normal">Stock</th>
					<th class="pb-2 font-normal">52 Week</th>
					<th class="pb-2 text-right font-normal whitespace-nowrap">Breakout</th>
					<th class="pb-2 text-right font-normal">LTP</th>
					<th class="pb-2 text-right font-normal whitespace-nowrap">New High/Low</th>
					<th class="pb-2 text-right font-normal whitespace-nowrap">Identified</th>
				</tr>
			</thead>
			<tbody>
				{#each BREAKOUT.rows as row (row.symbol)}
					<tr class="border-border-subtle/50 border-b last:border-0">
						<td class="text-muted-foreground py-2 text-[0.625rem] tabular-nums">{row.time}</td>
						<td class="py-2 pr-3">
							<span class="block text-[0.6875rem]">{row.symbol}</span>
							<span class="text-muted-foreground block text-[0.5625rem]">{row.name}</span>
						</td>
						<td class="py-2">
							<span
								class="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.5625rem] {row.high
									? 'border-bullish/40 text-bullish'
									: 'border-bearish/40 text-bearish'}"
							>
								{row.high ? 'HIGH' : 'LOW'}
								<Icon path={ICONS.arrow} class="size-2.5 {row.high ? '-rotate-45' : 'rotate-45'}" />
							</span>
						</td>
						<td class="text-muted-foreground py-2 text-right text-[0.625rem] tabular-nums">
							{row.breakout}
						</td>
						<td class="py-2 text-right text-[0.625rem] tabular-nums">
							<span class="block">{row.ltp}</span>
							<span class="block {row.pct >= 0 ? 'text-bullish' : 'text-bearish'}">
								{row.pct >= 0 ? '+' : ''}{row.pct.toFixed(2)}%
							</span>
						</td>
						<td
							class="py-2 text-right text-[0.625rem] tabular-nums {row.high
								? 'text-bullish'
								: 'text-bearish'}"
						>
							{row.level}
						</td>
						<td
							class="py-2 text-right text-[0.625rem] tabular-nums {row.identified >= 0
								? 'text-bullish'
								: 'text-bearish'}"
						>
							{row.identified >= 0 ? '+' : ''}{row.identified.toFixed(2)}%
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</Panel>
