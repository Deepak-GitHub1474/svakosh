<script lang="ts">
	import type { Snippet } from 'svelte';
	import Footer from '$lib/components/landing/Footer.svelte';
	import Nav from '$lib/components/landing/Nav.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<Nav sections={false} />
<main class="mx-auto max-w-6xl px-4 pt-12 sm:px-6 md:pt-16">
	{@render children()}
</main>
<Footer />
