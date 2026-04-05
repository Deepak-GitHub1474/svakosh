<script lang="ts">
	import '$src/app.css';
	import { BRAND } from '$lib/brand';
	import favicon from '$lib/assets/svakosh/favicon.svg';

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
{@render children()}
