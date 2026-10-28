<script lang="ts">
	import { BRAND } from '$lib/brand';
	import Landing from '$lib/components/landing/Landing.svelte';
</script>

<svelte:head>
	<title>{BRAND.title}</title>
	<meta name="description" content={BRAND.description} />
</svelte:head>

<Landing />
