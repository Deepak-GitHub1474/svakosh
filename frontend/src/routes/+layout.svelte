<script lang="ts">
	import '$src/app.css';
	import { BRAND } from '$lib/brand';
	import favicon from '$lib/assets/svakosh/favicon.svg';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { uiState } from '$lib/store/ui.svelte';
	import Header from '$lib/components/header/Header.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import Watchlist from '$lib/components/watchlist/Watchlist.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	let { children } = $props();

	$effect(() => {
		const watchlist = page.url.searchParams.get('watchlist');
		if (watchlist !== null) {
			uiState.isWatchlistVisible = watchlist === 'true';
		}
	});

	$effect(() => {
		const isVisible = uiState.isWatchlistVisible;
		const url = new URL(page.url);
		if (url.searchParams.get('watchlist') !== isVisible.toString()) {
			url.searchParams.set('watchlist', isVisible.toString());
			goto(url, { replaceState: true, noScroll: true, keepFocus: true });
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<title>{BRAND.name}</title>
	<meta name="description" content={BRAND.tagline} />
	<meta property="og:title" content={BRAND.taglineFull} />
	<meta property="og:description" content={BRAND.tagline} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<div class="h-screen flex flex-col">
	<Header />
	<div class="flex flex-1 pt-4">
		<Sidebar />
        <div class="hidden lg:block">
            <Watchlist />
        </div>
		<main
			class="flex-1 overflow-y-auto transition-all duration-300 ease-in-out
            {uiState.isWatchlistVisible ? 'lg:ml-[295px] 2xl:ml-[355px] ml-0' : 'lg:ml-40 ml-0'}"
>
			<div class="p-4 pt-10 lg:pl-16">
				{@render children()}
			</div>
		</main>
	</div>
	<MobileMenu />
</div>
