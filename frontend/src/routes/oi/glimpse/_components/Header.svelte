<script lang="ts">
	import { fade } from 'svelte/transition';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import { OI_TIMEFRAMES, EXPIRIES } from '../_lib/const';
	import type { TTimeFrame } from '../_lib/types';

	interface Props {
		time: TTimeFrame;
		expiry: string;
		onTimeChange: (val: TTimeFrame) => void;
		onExpiryChange: (val: string) => void;
	}

	let { time, expiry, onTimeChange, onExpiryChange }: Props = $props();

	let timeframeChoices = OI_TIMEFRAMES.map(t => ({ value: t, label: t }));
	let expiryChoices = EXPIRIES.map(e => ({ value: e, label: e.replace('_', ' ') }));

	let isTimeframeOpen = $state(false);
	let isExpiryOpen = $state(false);

	$effect(() => {
		if (isTimeframeOpen) isExpiryOpen = false;
	});

	$effect(() => {
		if (isExpiryOpen) isTimeframeOpen = false;
	});
</script>

<div in:fade={{ duration: 800 }} class="sticky top-0 z-[60] bg-background/95 backdrop-blur-md border-b border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-4 pb-4 pt-4">
	<header>
		<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
			OI Glimpse
		</h1>
		<p class="text-muted-foreground text-sm">Categorized view of OI Writing and Unwinding sentiment</p>
	</header>

	<div class="flex items-center gap-4">
		<div class="w-full sm:w-32">
			<SvaKoshLabel for="timeframe">Timeframe</SvaKoshLabel>
			<SvaKoshSelector
				id="timeframe"
				options={timeframeChoices}
				value={time}
				bind:isOpen={isTimeframeOpen}
				onSelect={(val) => onTimeChange(val as TTimeFrame)}
				placeholder="Select Time"
			/>
		</div>
		<div class="w-full sm:w-48">
			<SvaKoshLabel for="expiry">Expiry</SvaKoshLabel>
			<SvaKoshSelector
				id="expiry"
				options={expiryChoices}
				value={expiry}
				bind:isOpen={isExpiryOpen}
				onSelect={onExpiryChange}
				placeholder="Select Expiry"
			/>
		</div>
	</div>
</div>
