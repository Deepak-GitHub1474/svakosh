<script lang="ts">
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import { TRACKER_SYMBOLS, EXPIRIES } from '../_lib/const';
	import { cn } from '$lib/utils';

	interface Props {
		activeTab: 'tables' | 'graphs';
		onTabChange: (tab: 'tables' | 'graphs') => void;
		expiry: string;
		onExpiryChange: (val: string) => void;
		selectedSymbols: string[];
		onSymbolsChange: (symbols: string[]) => void;
	}

	let { 
		activeTab, 
		onTabChange, 
		expiry, 
		onExpiryChange, 
		selectedSymbols, 
		onSymbolsChange 
	}: Props = $props();

	const expiryOptions = EXPIRIES.map(e => ({ label: e.replace('_', ' '), value: e }));
	
	function toggleSymbol(sym: string) {
		if (selectedSymbols.includes(sym)) {
			onSymbolsChange(selectedSymbols.filter(s => s !== sym));
		} else {
			onSymbolsChange([...selectedSymbols, sym]);
		}
	}
</script>

<div class="flex flex-col md:flex-row md:items-end justify-between gap-6 py-6 border-b border-white/5">
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-1 bg-white/5 p-1 rounded-lg self-start">
			<button
				onclick={() => onTabChange('tables')}
				class="px-6 py-1.5 rounded-md text-sm font-medium transition-all {activeTab === 'tables' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}"
			>
				Tables
			</button>
			<button
				onclick={() => onTabChange('graphs')}
				class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {activeTab === 'graphs' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}"
			>
				Graphs
			</button>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each TRACKER_SYMBOLS as sym}
				<button
					onclick={() => toggleSymbol(sym)}
					class={cn(
						'px-3 py-1.5 rounded-lg border text-xs transition-all duration-300 font-medium',
						selectedSymbols.includes(sym) 
							? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
							: 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
					)}
				>
					{sym}
				</button>
			{/each}
		</div>
	</div>

	<div class="w-full md:w-48">
		<SvaKoshLabel for="expiry">Expiry</SvaKoshLabel>
		<SvaKoshSelector
			id="expiry"
			options={expiryOptions}
			value={expiry}
			onSelect={onExpiryChange}
		/>
	</div>
</div>
