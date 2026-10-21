<script lang="ts">
	import { EMPTY_STATE } from '$lib/trade/const';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import StatStrip from '$lib/components/trade/StatStrip.svelte';
	import { tradeResource } from '$lib/trade/resource.svelte';
	import { getFunds } from '$lib/trade/service';
	import type { TFunds } from '$lib/trade/types';
	import { formatNumber } from '$lib/utils';

	const funds = tradeResource<TFunds | null>(getFunds, null, 30_000);
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
			{ label: 'Total', value: formatNumber(funds.data.total) }
		]}
	/>
	<p class="text-muted-foreground text-xs">
		Margin as reported by your broker. Add or withdraw funds in your broker app.
	</p>
{/if}
