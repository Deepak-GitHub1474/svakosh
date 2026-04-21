<script lang="ts">
	import type { TOISymbolDetail } from '../_lib/types';
	import { calculateTotalOI, getPriceClass } from '../_lib/helper';
	import { formatNumber } from '$lib/utils/helper';

	interface Props {
		symbol: string;
		data: TOISymbolDetail;
	}

	let { symbol, data }: Props = $props();

	let ceWritingTotal = $derived(calculateTotalOI(data.CE.Writing));
	let ceUnwindingTotal = $derived(calculateTotalOI(data.CE.Unwinding));
	let peWritingTotal = $derived(calculateTotalOI(data.PE.Writing));
	let peUnwindingTotal = $derived(calculateTotalOI(data.PE.Unwinding));
</script>

<div class="glass-panel overflow-hidden rounded-xl border border-border-subtle flex flex-col bg-[#14171a]/40 backdrop-blur-sm">
	<div class="flex border-b border-border-muted bg-[#1c1f24]">
		<div class="flex-1 text-center py-2 text-xs text-muted-foreground uppercase border-r border-border-subtle">CE</div>
		<div class="flex-[1.5] text-center py-2 text-sm text-primary tracking-wider">{symbol}</div>
		<div class="flex-1 text-center py-2 text-xs text-muted-foreground uppercase border-l border-border-subtle">PE</div>
	</div>

	<div class="grid grid-cols-4 text-[0.65rem] text-muted-foreground bg-white/5 border-b border-border-subtle">
		<div class="py-2 text-center border-r border-border-subtle">Strike / CW</div>
		<div class="py-2 text-center border-r border-border-subtle">Strike / CU</div>
		<div class="py-2 text-center border-r border-border-subtle">Strike / PW</div>
		<div class="py-2 text-center">Strike / PU</div>
	</div>

	<div class="grid grid-cols-4 text-[0.7rem]">
		<div class="border-r border-border-subtle flex flex-col">
			{#each data.CE.Writing as item, i}
				<div class="flex justify-between px-2 py-1.5 border-b border-border-subtle {i % 2 === 0 ? 'bg-white/[0.02]' : ''}">
					<span class="text-foreground/60">{item.Strike || '-'}</span>
					<span class={getPriceClass(item.OI)}>{formatNumber(item.OI) || '0.00'}</span>
				</div>
			{/each}
			<div class="mt-auto bg-bullish-subtle/30 py-2 border-t border-border-muted flex justify-between px-2 items-center text-bullish">
				<div class="text-[0.6rem] uppercase opacity-80">Total CW</div>
				<div class="text-xs">{formatNumber(ceWritingTotal)}</div>
			</div>
		</div>

		<div class="border-r border-border-subtle flex flex-col">
			{#each data.CE.Unwinding as item, i}
				<div class="flex justify-between px-2 py-1.5 border-b border-border-subtle {i % 2 === 0 ? 'bg-white/[0.02]' : ''}">
					<span class="text-foreground/60">{item.Strike || '-'}</span>
					<span class={getPriceClass(item.OI)}>{formatNumber(item.OI) || '0.00'}</span>
				</div>
			{/each}
			<div class="mt-auto bg-bearish-subtle/30 py-2 border-t border-border-muted flex justify-between px-2 items-center text-bearish">
				<div class="text-[0.6rem] uppercase opacity-80">Total CU</div>
				<div class="text-xs">{formatNumber(ceUnwindingTotal)}</div>
			</div>
		</div>

		<div class="border-r border-border-subtle flex flex-col">
			{#each data.PE.Writing as item, i}
				<div class="flex justify-between px-2 py-1.5 border-b border-border-subtle {i % 2 === 0 ? 'bg-white/[0.02]' : ''}">
					<span class="text-foreground/60">{item.Strike || '-'}</span>
					<span class={getPriceClass(item.OI)}>{formatNumber(item.OI) || '0.00'}</span>
				</div>
			{/each}
			<div class="mt-auto bg-bullish-subtle/30 py-2 border-t border-border-muted flex justify-between px-2 items-center text-bullish">
				<div class="text-[0.6rem] uppercase opacity-80">Total PW</div>
				<div class="text-xs">{formatNumber(peWritingTotal)}</div>
			</div>
		</div>

		<div class="flex flex-col">
			{#each data.PE.Unwinding as item, i}
				<div class="flex justify-between px-2 py-1.5 border-b border-border-subtle {i % 2 === 0 ? 'bg-white/[0.02]' : ''}">
					<span class="text-foreground/60">{item.Strike || '-'}</span>
					<span class={getPriceClass(item.OI)}>{formatNumber(item.OI) || '0.00'}</span>
				</div>
			{/each}
			<div class="mt-auto bg-bearish-subtle/30 py-2 border-t border-border-muted flex justify-between px-2 items-center text-bearish">
				<div class="text-[0.6rem] uppercase opacity-80">Total PU</div>
				<div class="text-xs">{formatNumber(peUnwindingTotal)}</div>
			</div>
		</div>
	</div>
</div>
