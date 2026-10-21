import Analytics from '$lib/components/svg-provider/material/Analytics.svelte';
import DonutSmall from '$lib/components/svg-provider/material/DonutSmall.svelte';
import SwapVert from '$lib/components/svg-provider/material/SwapVert.svelte';

export const navItems = [
	{ icon: Analytics, label: 'Options Analytics', href: '/options-analytics' },
	{ icon: DonutSmall, label: 'Market Overview', href: '/market-overview' },
	{ icon: SwapVert, label: 'Trade', href: '/trade' }
];