<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { uiState } from '$lib/store/ui.svelte';
	import Header from '$lib/components/header/Header.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import Watchlist from '$lib/components/watchlist/Watchlist.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	let { children, data } = $props();

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

<div class="h-screen flex flex-col">
	<Header user={data.user} />
	<div class="flex flex-1 pt-4">
		<Sidebar />
		<div class="hidden lg:block">
			<Watchlist watchlists={data.watchlists ?? []} />
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
