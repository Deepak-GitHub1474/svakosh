<script lang="ts">
	import '$src/app.css';
	import { page } from '$app/state';
	import { BRAND } from '$lib/brand';
	import favicon from '$lib/assets/svakosh/favicon.ico';
	import appleTouchIcon from '$lib/assets/svakosh/apple-touch-icon.png';
	import SvaKoshToaster from '$lib/components/svakosh/SvaKoshToaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} sizes="48x48" />
	<link rel="apple-touch-icon" href={appleTouchIcon} />
	<meta name="description" content={BRAND.description} />
	<link rel="canonical" href="{BRAND.url}{page.url.pathname}" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={BRAND.name} />
	<meta property="og:url" content="{BRAND.url}{page.url.pathname}" />
	<meta property="og:title" content={BRAND.taglineFull} />
	<meta property="og:description" content={BRAND.description} />
	<meta property="og:image" content="{BRAND.url}{appleTouchIcon}" />
	<meta name="twitter:card" content="summary" />
</svelte:head>

{@render children()}

<SvaKoshToaster />
