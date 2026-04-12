<script lang="ts">
	import { cn } from '$lib/utils';
	import { fly, fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import SearchIcon from '$lib/components/svg-provider/SearchIcon.svelte';
	import SvaKoshInput from './SvaKoshInput.svelte';

	type Option = {
		label: string;
		value: any;
		meta?: string;
	};

	let {
		options = [],
		value = $bindable(),
		isOpen = $bindable(false),
		placeholder = 'Select option...',
		searchable = false,
		class: className = '',
		onSelect
	} = $props<{
		options: Option[];
		value: any;
		isOpen?: boolean;
		placeholder?: string;
		searchable?: boolean;
		class?: string;
		onSelect?: (val: any) => void;
	}>();

	let searchQuery = $state('');

	const filteredOptions = $derived.by(() => {
		if (!searchable || !searchQuery) return options;
		const q = searchQuery.toLowerCase();
		return options.filter((o: Option) => o.label.toLowerCase().includes(q));
	});

	const selectedOption = $derived(options.find((o: Option) => o.value === value));

	function toggle() {
		isOpen = !isOpen;
		if (isOpen) searchQuery = '';
	}

	function handleSelect(val: any) {
		value = val;
		isOpen = false;
		if (onSelect) onSelect(val);
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (isOpen && !target.closest('.svakosh-selector')) {
			isOpen = false;
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('click', handleOutsideClick);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('click', handleOutsideClick);
		}
	});
</script>

<div class={cn('relative svakosh-selector', className)}>
	<button
		type="button"
		onclick={toggle}
		class="glass-panel group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all hover:border-primary/40"
	>
		<span class="text-sm tracking-wide">
			{selectedOption ? selectedOption.label : placeholder}
		</span>
		<svg
			class={cn(
				'h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary',
				isOpen && 'rotate-180'
			)}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="glass-panel absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-primary/20 shadow-2xl"
			transition:fly={{ y: -10, duration: 200 }}
		>
			{#if searchable}
				<div class="border-b border-white/5">
					<SvaKoshInput
						bind:value={searchQuery}
						placeholder="Search..."
						class="rounded-none border-0 focus:border-0 py-3.5"
						clearable={true}
					/>
				</div>
			{/if}

			<div class="max-h-60 min-h-[100px] overflow-y-auto">
				{#each filteredOptions as option}
					<button
						type="button"
						onclick={() => handleSelect(option.value)}
						class={cn(
							'flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary/5',
							value === option.value && 'border-l-2 border-primary bg-primary/10 text-primary'
						)}
					>
						<div class="flex items-center gap-2">
							<span class="text-xs tracking-wide">{option.label}</span>
							{#if value === option.value}
								<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
							{/if}
						</div>
						{#if option.meta}
							<span class="text-[0.625rem] text-muted-foreground">{option.meta}</span>
						{/if}
					</button>
				{:else}
					<div class="p-8 text-center" in:fade>
						<SearchIcon class="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
						<p class="text-[0.786rem] text-muted-foreground">
							No matches for "<span class="text-foreground/70">{searchQuery}</span>"
						</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
