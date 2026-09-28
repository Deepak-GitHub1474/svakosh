<script lang="ts">
	import { BRAND } from '$lib/brand';
	import Landing from '$lib/components/landing/Landing.svelte';
</script>

<svelte:head>
	<title>{BRAND.name} | {BRAND.tagline}</title>
	<meta
		name="description"
		content="SvaKosh is a market analytics desk for Indian indices and derivatives — open interest, max pain, straddle decay and breakout screeners in one workspace."
	/>
</svelte:head>

<Landing />
