<script lang="ts">
	import { fade } from 'svelte/transition';
	import { LOOKUP_SYMBOLS, EXPIRIES } from '../_lib/const';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshMultiSelector from '$lib/components/svakosh/SvaKoshMultiSelector.svelte';
	import SvaKoshSwitch from '$lib/components/svakosh/SvaKoshSwitch.svelte';
	import SvaKoshTabs from '$lib/components/svakosh/SvaKoshTabs.svelte';

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
</script>

<div in:fade={{ duration: 800 }} class="sticky top-0 z-[60] bg-background/95 backdrop-blur-md border-b border-border-subtle flex flex-col gap-4 mb-2 pb-3 pt-3">
	<header>
		<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
			OI Lookup
		</h1>
		<p class="text-muted-foreground text-sm">Market Intelligence System</p>
	</header>

	<div class="flex flex-col items-center justify-between md:flex-row gap-3">
		<div class="flex items-center gap-4 w-full">
			<SvaKoshTabs 
				tabs={[
					{ 
						label: 'Tables', 
						value: 'tables',
						svgPath: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z' 
					},
					{ 
						label: 'Graphs', 
						value: 'graphs',
						svgPath: 'M3 3v18h18V3H3zm16 16H5V5h14v14zM7 10l3 3 4-4 3 3' 
					}
				]}
				activeTab={activeTab}
				onTabChange={onTabChange}
			/>

			{#if activeTab === 'graphs'}
				<div class="flex items-center gap-3">
					<div class="w-32">
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
						<div class="flex items-center flex-col gap-2">
							<span class="text-[0.625rem] leading-none tracking-wide text-muted-foreground">{combined ? 'Combined' : 'Individual'}</span>
							<SvaKoshSwitch 
								id="combined" 
								checked={combined || false}
								onCheckedChange={onCombinedChange}
							/>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="flex items-center gap-3 w-full md:w-auto">
			<div class="w-full sm:w-40">
				<SvaKoshMultiSelector
					id="symbol"
					options={symbolChoices}
					bind:value={selectedSymbols}
					bind:isOpen={isSymbolOpen}
					onSelect={onSymbolsChange}
					placeholder="Select Symbols"
					searchable={true}
				/>
			</div>

			<div class="w-full sm:w-44">
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
</div>
