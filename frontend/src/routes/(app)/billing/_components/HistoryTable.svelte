<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import { TENURE_LABELS } from '$lib/billing/const';
	import {
		lastPayment,
		paidTotal,
		planMeta,
		renewal,
		rupees,
		shortDate
	} from '$lib/billing/helper';
	import type { TSubscription } from '$lib/billing/types';
	import { TABLE } from '$lib/trade/const';
	import { cn } from '$lib/utils';
	import StatusBadge from './StatusBadge.svelte';

	let {
		subs,
		targetOf,
		onCancel
	}: {
		subs: TSubscription[];
		targetOf: (sub: TSubscription) => string;
		onCancel: (sub: TSubscription) => void;
	} = $props();

	const TD = cn(TABLE.td, 'text-sm font-medium');
	const COLUMNS = [
		'Plan',
		'Period',
		'Status',
		'Started',
		'Renewal',
		'Payment',
		'Amount',
		'Payment ID',
		'Action'
	];
</script>

<div class={TABLE.wrap}>
	<table class={TABLE.table}>
		<thead class={TABLE.thead}>
			<tr class={TABLE.head}>
				{#each COLUMNS as column, i (i)}
					<th class={cn(TABLE.th, i === COLUMNS.length - 1 && 'text-right')}>{column}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each subs as sub (sub.id)}
				{@const meta = planMeta(sub, targetOf(sub))}
				{@const payment = lastPayment(sub)}
				<tr class={TABLE.row}>
					<td class={TD}>
						<p class="text-foreground">{sub.plan?.name ?? 'Plan'}</p>
						{#if meta}<p class="text-muted-foreground text-xs">{meta}</p>{/if}
					</td>
					<td class={TD}>{TENURE_LABELS[sub.tenure]}</td>
					<td class={TD}><StatusBadge status={sub.status} /></td>
					<td class={TD}>{shortDate(sub.started_at)}</td>
					<td class={TD}>{renewal(sub).value}</td>
					<td class={TD}>{payment.status}</td>
					<td class={TD}>{rupees(paidTotal(sub))}</td>
					<td class={cn(TD, 'text-muted-foreground')}>{payment.reference}</td>
					<td class={cn(TD, 'text-right')}>
						{#if sub.status === 'active' && sub.auto_renew}
							<SvaKoshButton
								variant="secondary"
								label="Cancel autopay"
								class="border-transparent"
								onclick={() => onCancel(sub)}
							/>
						{:else}
							<span class="text-muted-foreground">—</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
