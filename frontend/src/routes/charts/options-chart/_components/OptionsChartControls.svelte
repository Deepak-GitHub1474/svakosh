<script lang="ts">
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import { OPTIONS_SYMBOLS, OPTIONS_EXPIRIES, OPTION_METRICS } from '../_lib/const';
	import type { MetricType } from '../_lib/types';

	interface Props {
		symbol: string;
		expiry: string;
		strike: number;
		strikeOptions: { label: string, value: number }[];
		metric1: MetricType;
		metric2: MetricType;
		isSymbolOpen?: boolean;
		isExpiryOpen?: boolean;
		isStrikeOpen?: boolean;
		isMetric1Open?: boolean;
		isMetric2Open?: boolean;
		onSymbolChange: (val: string) => void;
		onExpiryChange: (val: string) => void;
		onStrikeChange: (val: number) => void;
		onMetric1Change: (val: MetricType) => void;
		onMetric2Change: (val: MetricType) => void;
	}

	let { 
		symbol = $bindable(), 
		expiry = $bindable(), 
		strike = $bindable(),
		strikeOptions,
		metric1 = $bindable(),
		metric2 = $bindable(),
		isSymbolOpen = $bindable(false),
		isExpiryOpen = $bindable(false),
		isStrikeOpen = $bindable(false),
		isMetric1Open = $bindable(false),
		isMetric2Open = $bindable(false),
		onSymbolChange,
		onExpiryChange,
		onStrikeChange,
		onMetric1Change,
		onMetric2Change
	}: Props = $props();

	const filteredMetrics1 = $derived(OPTION_METRICS.filter(m => m.value !== metric2));
	const filteredMetrics2 = $derived(OPTION_METRICS.filter(m => m.value !== metric1));

</script>

<div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto lg:justify-end justify-start">
	<div class="flex items-center gap-3 w-full sm:w-auto">
		<SvaKoshSelector 
			class="w-full lg:w-40"
			options={OPTIONS_SYMBOLS} 
			bind:value={symbol} 
			bind:isOpen={isSymbolOpen}
			onSelect={onSymbolChange}
			placeholder="Symbol"
		/>
		<SvaKoshSelector 
			class="w-full lg:w-44"
			options={OPTIONS_EXPIRIES} 
			bind:value={expiry} 
			bind:isOpen={isExpiryOpen}
			onSelect={onExpiryChange}
			placeholder="Expiry"
		/>
	</div>
	<SvaKoshSelector 
		class="w-full sm:w-32"
		options={strikeOptions} 
		bind:value={strike} 
		bind:isOpen={isStrikeOpen}
		onSelect={onStrikeChange}
		searchable={true}
		placeholder="Strike"
	/>
	<div class="flex items-center gap-3 w-full sm:w-auto">
		<SvaKoshSelector 
			class="w-full lg:w-36"
			options={filteredMetrics1} 
			bind:value={metric1} 
			bind:isOpen={isMetric1Open}
			onSelect={(v) => onMetric1Change(v as MetricType)}
			placeholder="Metric 1"
		/>
		<span class="text-muted-foreground/30 text-[10px] font-medium italic px-0.5">VS</span>
		<SvaKoshSelector 
			class="w-full lg:w-36"
			options={filteredMetrics2} 
			bind:value={metric2} 
			bind:isOpen={isMetric2Open}
			onSelect={(v) => onMetric2Change(v as MetricType)}
			placeholder="Metric 2"
		/>
	</div>
</div>
