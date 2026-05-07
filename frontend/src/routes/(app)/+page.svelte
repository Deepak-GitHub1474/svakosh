<script lang="ts">
	import { BRAND } from '$lib/brand';
	import Dashboard from '$lib/components/dashboard/Dashboard.svelte';
</script>

<svelte:head>
	<title>Dashboard | {BRAND.name}</title>
</svelte:head>

<main class="min-h-dvh flex flex-col">
	<Dashboard />
</main>
