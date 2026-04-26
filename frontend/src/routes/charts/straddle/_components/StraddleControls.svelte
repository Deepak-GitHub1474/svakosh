<script lang="ts">
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import { STRADDLE_SYMBOLS, STRADDLE_EXPIRIES } from '../_lib/const';

	interface Props {
		symbol: string;
		expiry: string;
		strike: number;
		strikes: number[];
		isSymbolOpen?: boolean;
		isExpiryOpen?: boolean;
		isStrikeOpen?: boolean;
		onSymbolChange: (val: string) => void;
		onExpiryChange: (val: string) => void;
		onStrikeChange: (val: number) => void;
	}

	let { 
		symbol = $bindable(), 
		expiry = $bindable(), 
		strike = $bindable(), 
		strikes,
		isSymbolOpen = $bindable(false),
		isExpiryOpen = $bindable(false),
		isStrikeOpen = $bindable(false),
		onSymbolChange,
		onExpiryChange,
		onStrikeChange
	}: Props = $props();

	const strikeOptions = $derived(strikes.map(s => ({ label: s.toString(), value: s })));
</script>

<div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
	<div class="flex items-center gap-3 w-full sm:w-auto">
		<div class="w-full sm:w-40">
			<SvaKoshSelector 
				options={STRADDLE_SYMBOLS} 
				bind:value={symbol} 
				bind:isOpen={isSymbolOpen}
				onSelect={onSymbolChange}
				placeholder="Symbol"
			/>
		</div>

		<div class="w-full sm:w-44">
			<SvaKoshSelector 
				options={STRADDLE_EXPIRIES} 
				bind:value={expiry} 
				bind:isOpen={isExpiryOpen}
				onSelect={onExpiryChange}
				placeholder="Expiry"
			/>
		</div>
	</div>

	<div class="w-full sm:w-36">
		<SvaKoshSelector 
			options={strikeOptions} 
			bind:value={strike} 
			bind:isOpen={isStrikeOpen}
			onSelect={onStrikeChange}
			searchable={true}
			placeholder="Strike Price"
		/>
	</div>
</div>
