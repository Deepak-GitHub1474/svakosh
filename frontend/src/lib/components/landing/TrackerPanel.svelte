<script lang="ts">
	import Panel from './Panel.svelte';
	import { TRACKER } from './data';

	const cell = (value: number) => (value >= 0 ? 'text-bullish' : 'text-bearish');
	const blocks = [TRACKER.nifty, TRACKER.banknifty];
</script>

<Panel
	title="OI Tracker"
	subtitle="Categorized view of OI Writing and Unwinding sentiment"
	chips={[TRACKER.selected, TRACKER.expiry]}
>
	<div class="flex items-center gap-1">
		<span class="bg-primary text-background rounded-md px-3 py-1 text-xs font-medium">Tables</span>
		<span class="text-muted-foreground rounded-md px-3 py-1 text-xs">Graphs</span>
	</div>

	{#each blocks as block (block.symbol)}
		<p class="text-primary mt-4 text-center text-sm tracking-wide">
			{block.symbol}
			<span class="text-muted-foreground text-[0.625rem]">(LAKHS)</span>
		</p>

		<div class="mt-2 grid gap-2 lg:grid-cols-2">
			{#each [{ heading: 'Call options', rows: block.call, tone: 'text-bearish' }, { heading: 'Put options', rows: block.put, tone: 'text-bullish' }] as side (side.heading)}
				<div class="border-border-subtle overflow-hidden rounded-lg border">
					<p
						class="border-border-subtle bg-background/60 border-b py-1.5 text-center text-[0.625rem] tracking-[0.12em] uppercase {side.tone}"
					>
						{side.heading}
					</p>

					<div class="overflow-x-auto">
						<table class="min-w-full">
							<thead>
								<tr class="border-border-subtle text-muted-foreground border-b text-[0.5625rem]">
									<th class="px-2 py-1.5 text-left font-normal">Category</th>
									{#each TRACKER.cols as col (col)}
										<th class="px-2 py-1.5 text-right font-normal whitespace-nowrap">{col}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each side.rows as row (row.cat)}
									<tr class="border-border-subtle/50 border-b last:border-0">
										<td
											class="px-2 py-1 text-[0.625rem] italic {row.cat === 'TOTAL'
												? 'text-primary'
												: 'text-muted-foreground'}"
										>
											{row.cat}
										</td>
										{#each row.v as value, i (i)}
											<td class="px-2 py-1 text-right text-[0.625rem] tabular-nums {cell(value)}">
												{value.toFixed(2)}
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/each}
		</div>
	{/each}
</Panel>
