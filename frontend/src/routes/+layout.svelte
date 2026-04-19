<script lang="ts">
	import '$src/app.css';
	import { BRAND } from '$lib/brand';
	import favicon from '$lib/assets/svakosh/favicon.svg';
	import { uiState } from '$lib/store/ui.svelte';
	import Header from '$lib/components/header/Header.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import Watchlist from '$lib/components/watchlist/Watchlist.svelte';

	let { children } = $props();
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
        <Watchlist />
		<main
			class="flex-1 overflow-y-auto transition-all duration-300 ease-in-out
            {uiState.isWatchlistVisible ? 'ml-[295px] 2xl:ml-[355px]' : 'ml-40'}"
>
			<div class="p-4 pt-10 pl-16">
				{@render children()}
			</div>
		</main>
	</div>
</div>
