<script lang="ts">
	import { untrack } from 'svelte';
	import { Spring } from 'svelte/motion';
	import { BRAND } from '$lib/brand';
	import { page } from '$app/state';
	import { navItems } from './const';
	import { uiState } from '$lib/store/ui.svelte';
	import MenuIcon from '../svg-provider/MenuIcon.svelte';
	import SvaKoshSwitch from '../svakosh/SvaKoshSwitch.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';

	let isProfileModalOpen = $state(false);
	let navRefs = $state<(HTMLAnchorElement | null)[]>([]);

	const currentPath = $derived(page.url.pathname);
	const activeIndex = $derived(navItems.findIndex((item) => currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))));

	let prevIndex = $state(untrack(() => activeIndex));
	let direction = $state<'none' | 'bullish' | 'bearish'>('none');

	const indicator = new Spring(
		{ left: 0, width: 0 },
		{
			stiffness: 0.1,
			damping: 0.4
		}
	);

	$effect(() => {
		const activeEl = navRefs[activeIndex];
		if (activeEl) {
			if (prevIndex !== activeIndex) {
				direction = activeIndex > prevIndex ? 'bullish' : 'bearish';
				prevIndex = activeIndex;
			}
			indicator.set({ left: activeEl.offsetLeft, width: activeEl.offsetWidth }).then(() => {
				direction = 'none';
			});
		}
	});

	function toggleProfileModal() {
		isProfileModalOpen = !isProfileModalOpen;
	}

	const indicatorColor = $derived.by(() => {
		if (direction === 'bullish') return 'var(--bullish)';
		if (direction === 'bearish') return 'var(--bearish)';
		return 'var(--primary)';
	});
</script>

<header class="fixed top-0 z-[1000] flex h-12 w-full items-center justify-between border-b border-border-subtle bg-background px-4">
	<div class="flex items-center h-full">
		<div 
			class="flex items-center transition-all duration-300 ease-in-out shrink-0 
            {uiState.isWatchlistVisible ? 'w-[322px] 2xl:w-[381px]' : 'lg:w-[168px] w-auto'}"
		>
			<span class="text-lg tracking-tighter text-primary uppercase select-none">
				{BRAND.name}
			</span>
		</div>
		<nav class="relative hidden lg:flex gap-8 items-center h-full ml-8">
			{#each navItems as item, i}
				<a
					bind:this={navRefs[i]}
					href={item.href}
					class="flex items-center gap-2 h-full text-[0.8125rem] tracking-wider transition-colors duration-300
                    {activeIndex === i ? 'text-primary' : 'text-muted-foreground hover:text-white'}"
				>
					<span class="material-symbols-outlined icon-size {activeIndex === i ? 'fill-1' : ''}" style={activeIndex === i ? "font-variation-settings: 'FILL' 1;" : ""}>
						{item.icon}
					</span>
					{item.label}
				</a>
			{/each}

			<div 
				class="absolute bottom-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
				style="left: {indicator.current.left}px; width: {indicator.current.width}px; opacity: {activeIndex === -1 ? 0 : 1};"
			>
				<!-- Background Glow -->
				<div 
					class="absolute inset-x-0 h-[3px] blur-[6px] transition-colors duration-500"
					style="background-color: {indicatorColor}; opacity: 0.3;"
				></div>

				<!-- The Horizontal Wick -->
				<div 
					class="absolute inset-x-0 h-[1px] transition-colors duration-500"
					style="background-color: {indicatorColor};"
				></div>
				
				<!-- The Solid "Body" (Market Candle) -->
				<div 
					class="absolute inset-x-[30%] h-[3px] transition-colors duration-500 shadow-[0_0_10px_rgba(var(--indicator-rgb),0.4)]"
					style="background-color: {indicatorColor};"
				></div>

				<!-- Sharp "Proper" Points -->
				<div 
					class="absolute left-0 -translate-x-[2px] w-0 h-0 border-y-[2px] border-y-transparent transition-colors duration-500"
					style="border-right: 4px solid {indicatorColor};"
				></div>
				<div 
					class="absolute right-0 translate-x-[2px] w-0 h-0 border-y-[2px] border-y-transparent transition-colors duration-500"
					style="border-left: 4px solid {indicatorColor};"
				></div>
			</div>
		</nav>
	</div>

	<div class="flex items-center gap-6 flex-1 justify-end">
		<button 
			onclick={toggleProfileModal}
			class="!hidden lg:inline-flex material-symbols-outlined text-muted-foreground hover:text-primary icon-size border border-primary/20 rounded-full p-1"
		>
			person
		</button>
	</div>

	<button 
		type="button"
		class="lg:hidden flex items-center text-muted-foreground hover:text-primary transition-colors"
		onclick={() => uiState.toggleMobileMenu()}
		aria-label="Open menu"
	>
		<MenuIcon class="w-6 h-6" />
	</button>
</header>

<SvaKoshModal 
    bind:isOpen={isProfileModalOpen} 
    position="top-right" 
    width="14rem"
>
    {#snippet icon()}
        <span class="material-symbols-outlined icon-size">person</span>
    {/snippet}

    {#snippet title()}
        <span class="text-xs text-white">Deepak Chaudhary</span>
        <span class="text-[0.625rem] text-muted-foreground">deepak@svakosh.com</span>
    {/snippet}

    <div class="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined icon-size">dark_mode</span>
            Dark Theme
        </div>
		<SvaKoshSwitch checked size="sm" />
    </div>
    <div class="h-[0.0625rem] bg-white/5 my-1 mx-2"></div>
    <button class="flex w-full items-center gap-3 px-3 py-2 text-xs text-bearish/80 hover:bg-bearish-subtle hover:text-bearish rounded-md transition-all duration-200 group">
        <span class="material-symbols-outlined icon-size">logout</span>
        Logout
    </button>
</SvaKoshModal>

