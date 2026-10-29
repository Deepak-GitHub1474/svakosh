<script lang="ts">
	import '$src/app.css';
	import { page } from '$app/state';
	import { BRAND } from '$lib/brand';
	import SvaKoshToaster from '$lib/components/svakosh/SvaKoshToaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="icon" type="image/png" href="/favicon-96.png" sizes="96x96" />
	<link rel="icon" type="image/png" href="/favicon-144.png" sizes="144x144" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="canonical" href="{BRAND.url}{page.url.pathname}" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={BRAND.name} />
	<meta property="og:url" content="{BRAND.url}{page.url.pathname}" />
	<meta property="og:title" content={BRAND.title} />
	<meta property="og:description" content={BRAND.description} />
	<meta property="og:image" content="{BRAND.url}/apple-touch-icon.png" />
	<meta name="twitter:card" content="summary" />
</svelte:head>

{@render children()}

<SvaKoshToaster />
