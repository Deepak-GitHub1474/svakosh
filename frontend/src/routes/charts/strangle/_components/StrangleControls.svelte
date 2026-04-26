<script lang="ts">
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import { STRANGLE_SYMBOLS, STRANGLE_EXPIRIES } from '../_lib/const';

	interface Props {
		symbol: string;
		expiry: string;
		ceStrike: number;
		peStrike: number;
		strikes: number[];
		isSymbolOpen?: boolean;
		isExpiryOpen?: boolean;
		isCeStrikeOpen?: boolean;
		isPeStrikeOpen?: boolean;
		onSymbolChange: (val: string) => void;
		onExpiryChange: (val: string) => void;
		onCeStrikeChange: (val: number) => void;
		onPeStrikeChange: (val: number) => void;
	}

	let { 
		symbol = $bindable(), 
		expiry = $bindable(), 
		ceStrike = $bindable(), 
		peStrike = $bindable(),
		strikes,
		isSymbolOpen = $bindable(false),
		isExpiryOpen = $bindable(false),
		isCeStrikeOpen = $bindable(false),
		isPeStrikeOpen = $bindable(false),
		onSymbolChange,
		onExpiryChange,
		onCeStrikeChange,
		onPeStrikeChange
	}: Props = $props();

	const strikeOptions = $derived(strikes.map(s => ({ label: s.toString(), value: s })));
</script>

<div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
	<div class="flex items-center gap-3 w-full lg:w-auto">
		<div class="w-full sm:w-36">
			<SvaKoshSelector 
				options={STRANGLE_SYMBOLS} 
				bind:value={symbol} 
				bind:isOpen={isSymbolOpen}
				onSelect={onSymbolChange}
				placeholder="Symbol"
			/>
		</div>

		<div class="w-full sm:w-44">
			<SvaKoshSelector 
				options={STRANGLE_EXPIRIES} 
				bind:value={expiry} 
				bind:isOpen={isExpiryOpen}
				onSelect={onExpiryChange}
				placeholder="Expiry"
			/>
		</div>
	</div>

	<div class="flex items-center gap-3 w-full lg:w-auto">
		<div class="w-full sm:w-32">
			<SvaKoshSelector 
				options={strikeOptions} 
				bind:value={ceStrike} 
				bind:isOpen={isCeStrikeOpen}
				onSelect={onCeStrikeChange}
				searchable={true}
				placeholder="Call Strike"
			/>
		</div>

		<div class="w-full sm:w-32">
			<SvaKoshSelector 
				options={strikeOptions} 
				bind:value={peStrike} 
				bind:isOpen={isPeStrikeOpen}
				onSelect={onPeStrikeChange}
				searchable={true}
				placeholder="Put Strike"
			/>
		</div>
	</div>
</div>
