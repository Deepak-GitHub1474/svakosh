<script lang="ts">
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshNumberInput from '$lib/components/svakosh/SvaKoshNumberInput.svelte';
	import { AIR_SYMBOLS, AIR_EXPIRIES } from '../_lib/const';

	interface Props {
		symbol: string;
		expiry: string;
		strikeCount: number;
		maxStrikeCount: number;
		isSymbolOpen?: boolean;
		isExpiryOpen?: boolean;
		onSymbolChange: (val: string) => void;
		onExpiryChange: (val: string) => void;
	}

	let { 
		symbol = $bindable(), 
		expiry = $bindable(), 
		strikeCount = $bindable(),
		maxStrikeCount,
		isSymbolOpen = $bindable(false),
		isExpiryOpen = $bindable(false),
		onSymbolChange,
		onExpiryChange
	}: Props = $props();

</script>

<div class="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end justify-start">
	<div class="flex items-center gap-3 w-full sm:w-auto">
		<SvaKoshSelector
			class="w-full sm:w-40" 
			options={AIR_SYMBOLS} 
			bind:value={symbol} 
			bind:isOpen={isSymbolOpen}
			onSelect={onSymbolChange}
			placeholder="Symbol"
		/>
		<SvaKoshSelector 
			class="w-full sm:w-44"
			options={AIR_EXPIRIES} 
			bind:value={expiry} 
			bind:isOpen={isExpiryOpen}
			onSelect={onExpiryChange}
			placeholder="Expiry"
		/>
	</div>
	<SvaKoshNumberInput 
		class="w-full sm:w-36"
		bind:value={strikeCount}
		min={0}
		max={maxStrikeCount}
		step={1}
		label="Strikes"
	/>
</div>
