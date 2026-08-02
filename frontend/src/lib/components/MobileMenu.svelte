<script lang="ts">
	import { page } from '$app/state';
	import { cubicInOut, cubicOut } from 'svelte/easing';
	import { fade, fly, slide } from 'svelte/transition';
	import { uiState } from '$lib/store/ui.svelte';
	import { navItems } from './header/const';
	import { menuItems } from './sidebar/const';
	import { BRAND } from '$lib/brand';
	import CloseIcon from './svg-provider/CloseIcon.svelte';
	import SvaKoshAvatar from './svakosh/SvaKoshAvatar.svelte';
	import AccountMenu from './account/AccountMenu.svelte';
	import ExpandLess from '$lib/components/svg-provider/material/ExpandLess.svelte';
	import Preview from '$lib/components/svg-provider/material/Preview.svelte';

	type TUser = {
		email?: string | null;
		mobile_number?: string | null;
		profile?: {
			full_name?: string | null;
			username?: string | null;
			avatar?: string | null;
		} | null;
	} | null;

	interface Props {
		user?: TUser;
	}

	let { user = null }: Props = $props();

	const displayName = $derived(
		user?.profile?.full_name?.trim() || user?.profile?.username?.trim() || 'Unknown'
	);
	const displayIdentifier = $derived(user?.email || user?.mobile_number || '');
	const avatarUrl = $derived(user?.profile?.avatar?.trim() || '');

	const allItems = [...navItems, ...menuItems];

	let isAccountOpen = $state(false);

	function closeMenu() {
		uiState.isMobileMenuOpen = false;
	}

	function handleNavigate() {
		closeMenu();
	}

	function openWatchlist() {
		closeMenu();
		uiState.isWatchlistVisible = true;
	}

	$effect(() => {
		if (!uiState.isMobileMenuOpen) isAccountOpen = false;
	});

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
			<button
				type="button"
				onclick={openWatchlist}
				class="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground transition-all duration-300 hover:bg-white/[0.03] hover:text-white cursor-pointer"
			>
				<Preview class="icon-size" />
				<span class="text-xs tracking-wide">Watchlist</span>
			</button>

			{#each allItems as item}
				<a
					href={item.href}
					onclick={handleNavigate}
					class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
					{page.url.pathname === item.href
						? 'bg-primary-subtle text-primary border-l-2 border-primary'
						: 'text-muted-foreground hover:bg-white/[0.03] hover:text-white'}"
				>
					<item.icon class="icon-size" filled={page.url.pathname === item.href} />
					<span class="text-xs tracking-wide">
						{item.label}
					</span>
				</a>
			{/each}
		</div>

		<div class="border-t border-border-subtle shrink-0">
			{#if isAccountOpen}
				<div
					class="border-b border-border-subtle px-2 py-2"
					transition:slide={{ duration: 220, easing: cubicOut }}
				>
					<AccountMenu compact={false} onNavigate={handleNavigate} />
				</div>
			{/if}

			<button
				type="button"
				onclick={() => (isAccountOpen = !isAccountOpen)}
				aria-expanded={isAccountOpen}
				aria-label="Account menu"
				class="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.03]"
			>
				<SvaKoshAvatar
					url={avatarUrl}
					name={displayName}
					class="h-9 w-9 shrink-0 border border-primary/20 text-xs"
				/>
				<div class="flex min-w-0 flex-1 flex-col">
					<span class="truncate text-xs text-foreground">{displayName}</span>
					{#if displayIdentifier}
						<span class="truncate text-[0.625rem] text-muted-foreground">{displayIdentifier}</span>
					{/if}
				</div>
				<ExpandLess class="icon-size shrink-0 text-muted-foreground transition-transform duration-200 {isAccountOpen ? 'rotate-180' : ''}" />
			</button>
		</div>
	</div>
{/if}
