<script lang="ts">
	import '$src/app.css';
	import { BRAND } from '$lib/brand';
	import favicon from '$lib/assets/svakosh/favicon.ico';
	import appleTouchIcon from '$lib/assets/svakosh/apple-touch-icon.png';
	import SvaKoshToaster from '$lib/components/svakosh/SvaKoshToaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} sizes="48x48" />
	<link rel="apple-touch-icon" href={appleTouchIcon} />
	<title>{BRAND.name}</title>
	<meta name="description" content={BRAND.tagline} />
	<meta property="og:title" content={BRAND.taglineFull} />
	<meta property="og:description" content={BRAND.tagline} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

{@render children()}

<SvaKoshToaster />
