<script lang="ts">
	import { EMPTY_STATE } from '$lib/trade/const';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import StatStrip from '$lib/components/trade/StatStrip.svelte';
	import { signed, tone } from '$lib/trade/format';
	import { tradeResource } from '$lib/trade/resource.svelte';
	import { getFunds } from '$lib/trade/service';
	import type { TFunds } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	type TLine = { label: string; value: number; pnl?: boolean };

	const funds = tradeResource<TFunds | null>(getFunds, null, 30_000);

	const groups = $derived.by<{ title: string; lines: TLine[] }[]>(() => {
		const f = funds.data;
		if (!f) return [];
		return [
			{
				title: 'Cash',
				lines: [
					{ label: 'Opening balance', value: f.opening_balance },
					{ label: 'Pay-in today', value: f.pay_in },
					{ label: 'Pay-out', value: f.pay_out },
					{ label: 'Collateral', value: f.collateral }
				]
			},
			{
				title: 'Margin used',
				lines: [
					{ label: 'SPAN', value: f.span },
					{ label: 'Exposure', value: f.exposure },
					{ label: 'Option premium', value: f.option_premium },
					{ label: 'Total used', value: f.used }
				]
			},
			{
				title: 'P&L',
				lines: [
					{ label: 'Realised', value: f.realised_pnl, pnl: true },
					{ label: 'Unrealised', value: f.unrealised_pnl, pnl: true }
				]
			}
		];
	});
</script>

{#if funds.loading && !funds.data}
	<div class="relative h-40"><SvaKoshLoader inline message="" /></div>
{:else if funds.error && !funds.data}
	<EmptyState
		class={EMPTY_STATE}
		title="Could not load funds"
		description={funds.error}
		actionLabel="Retry"
		onAction={funds.reload}
	/>
{:else if funds.data}
	<StatStrip
		stats={[
			{ label: 'Available', value: formatNumber(funds.data.available), tone: 'text-primary' },
			{ label: 'Used', value: formatNumber(funds.data.used) },
			{ label: 'Opening balance', value: formatNumber(funds.data.opening_balance) }
		]}
	/>
	<div class="grid gap-3 md:grid-cols-3">
		{#each groups as group (group.title)}
			<section class="glass-panel rounded-xl px-4 py-3">
				<h2 class="text-muted-foreground mb-2 text-xs tracking-widest uppercase">{group.title}</h2>
				<dl class="divide-glass-border divide-y text-sm">
					{#each group.lines as line (line.label)}
						<div class="flex items-center justify-between gap-4 py-2">
							<dt class="text-muted-foreground">{line.label}</dt>
							<dd class="tabular-nums {line.pnl ? tone(line.value) : 'text-foreground'}">
								{line.pnl ? signed(line.value) : formatNumber(line.value)}
							</dd>
						</div>
					{/each}
				</dl>
			</section>
		{/each}
	</div>
	<p class="text-muted-foreground mt-4 text-xs">
		Margin as reported by your broker. Add or withdraw funds in your broker app.
	</p>
{/if}
