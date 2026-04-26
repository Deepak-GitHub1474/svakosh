<script lang="ts">
	import { page } from '$app/state';
	import { cubicInOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { uiState } from '$lib/store/ui.svelte';
	import { navItems } from './header/const';
	import { menuItems } from './sidebar/const';
	import { BRAND } from '$lib/brand';
	import SvaKoshButton from './svakosh/SvaKoshButton.svelte';
	import CloseIcon from './svg-provider/CloseIcon.svelte';

	const allItems = [...navItems, ...menuItems];

	function closeMenu() {
		uiState.isMobileMenuOpen = false;
	}

	function handleNavigate() {
		closeMenu();
	}

	$effect(() => {
		if (uiState.isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if uiState.isMobileMenuOpen}
	<button
		type="button"
		class="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm lg:hidden"
		onclick={closeMenu}
		transition:fade={{ duration: 300 }}
		aria-label="Close menu"
	></button>

	<div
		class="fixed inset-y-0 right-0 z-[1110] flex h-full w-72 flex-col border-l border-border-subtle bg-background lg:hidden shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
		transition:fly={{ x: 300, duration: 400, easing: cubicInOut }}
	>
		<div class="flex items-center justify-between border-b border-border-subtle px-6 py-4">
			<a 
				href="/" 
				onclick={handleNavigate}
				class="text-xs tracking-tighter text-primary uppercase select-none hover:opacity-80 transition-opacity"
			>
				{BRAND.name}
			</a>
			<button 
				onclick={closeMenu}
				class="text-muted-foreground hover:text-primary transition-colors"
			>
				<CloseIcon class="w-5 h-5" />
			</button>
		</div>

		<div class="flex-1 overflow-y-auto px-4 py-6 space-y-1 hide-scrollbar">
			{#each allItems as item}
				<a
					href={item.href}
					onclick={handleNavigate}
					class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
					{page.url.pathname === item.href 
						? 'bg-primary-subtle text-primary border-l-2 border-primary' 
						: 'text-muted-foreground hover:bg-white/[0.03] hover:text-white'}"
				>
					<span class="material-symbols-outlined icon-size {page.url.pathname === item.href ? 'fill-1' : ''}" style={page.url.pathname === item.href ? "font-variation-settings: 'FILL' 1;" : ""}>
						{item.icon}
					</span>
					<span class="text-xs tracking-wide">
						{item.label}
					</span>
				</a>
			{/each}
		</div>

		<div class="border-t border-border-subtle p-6">
			<SvaKoshButton 
				variant="bearish" 
				label="Logout"
				class="w-full justify-center normal-case text-xs h-10"
				onclick={() => {
					closeMenu();
				}}
			>
				{#snippet icon()}
					<span class="material-symbols-outlined icon-size">logout</span>
				{/snippet}
			</SvaKoshButton>
		</div>
	</div>
{/if}
