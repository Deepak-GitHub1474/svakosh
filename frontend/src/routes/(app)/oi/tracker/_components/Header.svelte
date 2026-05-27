<script lang="ts">
	import { fade } from 'svelte/transition';
	import { TRACKER_SYMBOLS, EXPIRIES, TABS } from '../_lib/const';
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

	const expiryOptions = EXPIRIES.map(e => ({ label: e.replace('_', ' '), value: e }));
	const symbolChoices = TRACKER_SYMBOLS.map(s => ({ label: s, value: s }));
	const oiChoices = [
		{ value: 'Total OI', label: 'Total OI' },
		{ value: 'OI Change', label: 'OI Change' }
	];

	let isExpiryOpen = $state(false);
	let isSymbolOpen = $state(false);
	let isOiOpen = $state(false);
</script>

<div in:fade={{ duration: 800 }} class="sticky top-0 z-10 border-b border-border-subtle py-3">
	<header>
		<h1 class="text-2xl tracking-tight text-primary mb-1 flex items-center gap-3">
			OI Tracker
		</h1>
		<p class="text-muted-foreground text-sm">Categorized view of OI Writing and Unwinding sentiment</p>
	</header>

	<div class="flex flex-col items-center justify-between md:flex-row gap-3 mt-4">
		<div class="flex items-center gap-4 w-full">
			<SvaKoshTabs 
				tabs={TABS}
				activeTab={activeTab} 
				onTabChange={(id) => onTabChange(id as any)} 
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
					placeholder="Select Indices"
					searchable={true}
				/>
			</div>

			<div class="w-full sm:w-44">
				<SvaKoshSelector
					id="expiry"
					options={expiryOptions}
					value={expiry}
					bind:isOpen={isExpiryOpen}
					onSelect={onExpiryChange}
					placeholder="Select Expiry"
				/>
			</div>
		</div>
	</div>
</div>
