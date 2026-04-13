<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshSwitch from '$lib/components/svakosh/SvaKoshSwitch.svelte';
	import { LOOKUP_SYMBOLS, EXPIRIES } from '../_lib/const';

	interface Props {
		activeTab: 'tables' | 'graphs';
		onTabChange: (tab: 'tables' | 'graphs') => void;
		expiry: string;
		onExpiryChange: (val: string) => void;
		selectedSymbols: string[];
		onSymbolsChange: (symbols: string[]) => void;
		oiOption?: string;
		onOiOptionChange?: (val: string) => void;
		combined?: boolean;
		onCombinedChange?: (val: boolean) => void;
	}

	let { 
		activeTab, onTabChange, 
		expiry, onExpiryChange, 
		selectedSymbols, onSymbolsChange,
		oiOption, onOiOptionChange,
		combined, onCombinedChange
	}: Props = $props();

	let expiryChoices = EXPIRIES.map(e => ({ value: e, label: e.replace('_', ' ') }));
	let symbolChoices = LOOKUP_SYMBOLS.map(s => ({ value: s, label: s }));
	let oiChoices = [
		{ value: 'Total OI', label: 'Total OI' },
		{ value: 'OI Change', label: 'OI Change' }
	];

	let isExpiryOpen = $state(false);
	let isSymbolOpen = $state(false);
	let isOiOpen = $state(false);

	function toggleSymbol(sym: string) {
		if (selectedSymbols.includes(sym)) {
			onSymbolsChange(selectedSymbols.filter(s => s !== sym));
		} else {
			onSymbolsChange([...selectedSymbols, sym]);
		}
	}
</script>

<div in:fade={{ duration: 800 }} class="sticky top-0 z-[60] bg-background/95 backdrop-blur-md border-b border-white/5 flex flex-col gap-6 mb-4 pb-4 pt-4">
	<div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
		<header>
			<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
				OI Lookup
			</h1>
			<p class="text-muted-foreground text-sm">Deep-dive multidimensional Open Interest analysis</p>
		</header>

		<div class="flex bg-[#1c1f24] p-1 rounded-lg border border-white/5 h-fit self-end md:self-auto">
			<button 
				onclick={() => onTabChange('tables')}
				class={cn(
					'px-6 py-1.5 rounded-md text-sm transition-all duration-300',
					activeTab === 'tables' ? 'bg-primary text-black font-medium shadow-lg' : 'text-muted-foreground hover:text-foreground'
				)}
			>
				Tables
			</button>
			<button 
				onclick={() => onTabChange('graphs')}
				class={cn(
					'px-6 py-1.5 rounded-md text-sm transition-all duration-300',
					activeTab === 'graphs' ? 'bg-primary text-black font-medium shadow-lg' : 'text-muted-foreground hover:text-foreground'
				)}
			>
				Graphs
			</button>
		</div>
	</div>

	<div class="flex flex-wrap items-end gap-6">
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

		{#if activeTab === 'tables'}
			<div class="flex flex-wrap gap-2">
				{#each LOOKUP_SYMBOLS as sym}
					<button
						onclick={() => toggleSymbol(sym)}
						class={cn(
							'px-3 py-1.5 rounded-lg border text-xs transition-all duration-300',
							selectedSymbols.includes(sym) 
								? 'bg-primary/20 border-primary text-primary' 
								: 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
						)}
					>
						{sym}
					</button>
				{/each}
			</div>
		{:else}
			<div class="w-full sm:w-48">
				<SvaKoshLabel for="symbol">Index</SvaKoshLabel>
				<SvaKoshSelector
					id="symbol"
					options={symbolChoices}
					value={selectedSymbols[0] || 'NIFTY'}
					bind:isOpen={isSymbolOpen}
					onSelect={(val) => onSymbolsChange([val])}
					placeholder="Select Index"
				/>
			</div>

			<div class="w-full sm:w-48">
				<SvaKoshLabel for="oiOption">OI View</SvaKoshLabel>
				<SvaKoshSelector
					id="oiOption"
					options={oiChoices}
					value={oiOption}
					bind:isOpen={isOiOpen}
					onSelect={onOiOptionChange}
					placeholder="Select View"
				/>
			</div>

			{#if onCombinedChange}
				<div class="flex flex-col gap-2">
					<SvaKoshLabel for="combined">Combined CE/PE</SvaKoshLabel>
					<div class="flex items-center gap-3 bg-white/5 px-4 py-[0.65rem] rounded-xl border border-white/10 h-[43px]">
						<SvaKoshSwitch 
							id="combined" 
							checked={combined || false}
							onCheckedChange={onCombinedChange}
						/>
						<span class="text-xs text-muted-foreground uppercase tracking-widest">{combined ? 'On' : 'Off'}</span>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
