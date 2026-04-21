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
		id,
		options = [],
		value = $bindable([]),
		isOpen = $bindable(false),
		placeholder = 'Select options...',
		searchable = false,
		class: className = '',
		onSelect
	} = $props<{
		id?: string;
		options: Option[];
		value: any[];
		isOpen?: boolean;
		placeholder?: string;
		searchable?: boolean;
		class?: string;
		onSelect?: (val: any[]) => void;
	}>();

	let searchQuery = $state('');

	const filteredOptions = $derived.by(() => {
		if (!searchQuery) return options;
		const q = searchQuery.toLowerCase();
		return options.filter((o: Option) => o.label.toLowerCase().includes(q));
	});

	const displayLabel = $derived.by(() => {
		if (value.length === 0) return placeholder;
		if (value.length === 1) {
			const opt = options.find((o: Option) => o.value === value[0]);
			return opt ? opt.label : placeholder;
		}
		return `${value.length} Selected`;
	});

	function toggle() {
		isOpen = !isOpen;
		if (isOpen) searchQuery = '';
	}

	function handleToggle(val: any) {
		const index = value.indexOf(val);
		if (index === -1) {
			value = [...value, val];
		} else {
			value = value.filter((v: any) => v !== val);
		}
		if (onSelect) onSelect(value);
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (isOpen && !target.closest('.svakosh-multi-selector')) {
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

<div class={cn('relative svakosh-multi-selector', className)}>
	<button
		{id}
		type="button"
		onclick={toggle}
		class="glass-panel group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all hover:border-primary/40 text-left"
	>
		<span class="text-xs tracking-wide truncate pr-4">
			{displayLabel}
		</span>
		<svg
			class={cn(
				'h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary shrink-0',
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
			class="glass-panel bg-surface absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-primary/20 shadow-2xl"
			transition:fly={{ y: -10, duration: 200 }}
		>
			{#if searchable}
				<div class="border-b border-border-subtle">
					<SvaKoshInput
						bind:value={searchQuery}
						placeholder="Search symbols..."
						class="rounded-none border-0 focus:border-0 py-3.5"
						clearable={true}
					/>
				</div>
			{/if}

			<div class="max-h-60 min-h-[100px] overflow-y-auto custom-scrollbar">
				{#each filteredOptions as option}
					<button
						type="button"
						onclick={() => handleToggle(option.value)}
						class={cn(
							'flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary/5',
							value.includes(option.value) && 'bg-primary/10 text-primary'
						)}
					>
						<div class="flex items-center gap-2">
							<div class={cn(
								'w-4 h-4 rounded border flex items-center justify-center transition-all',
								value.includes(option.value) ? 'bg-primary border-primary' : 'border-white/20 bg-white/5'
							)}>
								{#if value.includes(option.value)}
									<svg class="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</div>
							<span class="text-xs tracking-wide">{option.label}</span>
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
