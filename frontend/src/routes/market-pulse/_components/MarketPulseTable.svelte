<script lang="ts">
	import { formatNumber } from '$lib/utils/helper';
	import type { TMarketPulseData, TMarketPulseRow } from '../_lib/types';
	import { PULSE_COLUMNS } from '../_lib/const';
	import { getSignalVariant, isNumericColumn, isSignalColumn } from '../_lib/helper';
	import SvaKoshBadge from '$lib/components/svakosh/SvaKoshBadge.svelte';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import HighIcon from '$lib/components/svg-provider/MaximizeIcon.svelte';

	interface Props {
		pulseData: TMarketPulseData;
		liveRow: TMarketPulseRow | null;
	}

	let { pulseData, liveRow }: Props = $props();

	const sortedTimes: string[] = $derived(Object.keys(pulseData).sort((a: string, b: string) => b.localeCompare(a)));
</script>

<SvaKoshCard class="!p-0 !overflow-hidden border-border-subtle bg-surface/40 shadow-2xl">
	<div class="overflow-x-auto no-scrollbar">
		<table class="w-full text-xs border-collapse">
			<thead class="bg-surface">
				<tr class="text-muted-foreground border-b border-border-subtle">
					{#each PULSE_COLUMNS as col, i}
						<th class="py-[0.875rem] px-4 uppercase tracking-wider whitespace-nowrap {isNumericColumn(i) ? 'text-right' : 'text-left'} {isSignalColumn(i) ? 'text-center' : ''}">
							{col}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-border-subtle">
				{#if liveRow}
					<tr class="bg-primary/10 border-b border-primary/20 group animate-pulse">
						<td class="px-4 py-3 whitespace-nowrap text-primary">
							{liveRow.time}
						</td>
						<td class="px-4 py-3 text-primary text-right">{liveRow.spot.toFixed(2)}</td>
						<td class="px-4 py-3 text-bullish text-right">{formatNumber(liveRow.ceOIChange)}</td>
						<td class="px-4 py-3 text-bearish text-right">{formatNumber(liveRow.peOIChange)}</td>
						<td class="px-4 py-3 text-right">{formatNumber(liveRow.oiChange)}</td>
						<td class="px-4 py-3 text-center">
							{#if liveRow.dayHL !== 'Normal'}
								<SvaKoshBadge label={liveRow.dayHL} variant={getSignalVariant(liveRow.dayHL)} class="scale-90" />
							{:else}
								<span class="px-2 text-muted-foreground/40 text-[0.625rem]">-</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-center">
							<SvaKoshBadge label={liveRow.optionSignal} variant={getSignalVariant(liveRow.optionSignal)} />
						</td>
						<td class="px-4 py-3 text-right">{liveRow.vwap.toFixed(2)}</td>
						<td class="px-4 py-3 text-center">
							<SvaKoshBadge label="Bullish" variant="bullish" icon={HighIcon} />
						</td>
						<td class="px-4 py-3 text-center">
							<SvaKoshBadge label="Bearish" variant="bearish" />
						</td>
						<td class="px-4 py-3 text-right">{formatNumber(liveRow.futCOI)}</td>
						<td class="px-4 py-3 text-right">{liveRow.atmStraddle.toFixed(2)}</td>
					</tr>
				{/if}

				{#each sortedTimes as time}
					{@const row = pulseData[time]}
					<tr class="hover:bg-border-subtle/50 transition-colors group">
						<td class="px-4 py-3 text-muted-foreground whitespace-nowrap group-hover:text-foreground">
							{row.time}
						</td>
						<td class="px-4 py-3 group-hover:text-foreground text-right">{row.spot.toFixed(2)}</td>
						<td class="px-4 py-3 {row.ceOIChange >= 0 ? 'text-bullish' : 'text-bearish'} text-right">
							{formatNumber(row.ceOIChange)}
						</td>
						<td class="px-4 py-3 {row.peOIChange >= 0 ? 'text-bullish' : 'text-bearish'} text-right">
							{formatNumber(row.peOIChange)}
						</td>
						<td class="px-4 py-3 text-right">{formatNumber(row.oiChange)}</td>
						<td class="px-4 py-3 text-center">
							{#if row.dayHL !== 'Normal'}
								<SvaKoshBadge label={row.dayHL} variant={getSignalVariant(row.dayHL)} class="scale-90" />
							{:else}
								<span class="px-2 text-muted-foreground/40 text-[0.625rem]">-</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-center">
							<SvaKoshBadge label={row.optionSignal} variant={getSignalVariant(row.optionSignal)} />
						</td>
						<td class="px-4 py-3 text-muted-foreground text-right">{row.vwap.toFixed(2)}</td>
						<td class="px-4 py-3 text-center">
							<SvaKoshBadge label={row.callSignal === 'Strong' ? 'Bullish' : 'Weak'} variant={getSignalVariant(row.callSignal)} />
						</td>
						<td class="px-4 py-3 text-center">
							<SvaKoshBadge label={row.putSignal === 'Strong' ? 'Bearish' : 'Weak'} variant={getSignalVariant(row.putSignal === 'Strong' ? 'Bearish' : 'Neutral')} />
						</td>
						<td class="px-4 py-3 text-right">{formatNumber(row.futCOI)}</td>
						<td class="px-4 py-3 text-right">{row.atmStraddle.toFixed(2)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</SvaKoshCard>
