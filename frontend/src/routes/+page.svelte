<script lang="ts">
	import { BRAND } from '$lib/brand';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
</script>

<main class="bg-background flex min-h-dvh flex-col items-center gap-14 px-4 py-12">
	<SvaKoshCard class="max-w-md p-8 shadow-2xl">
		<h1 class="text-primary text-center text-2xl font-semibold tracking-tight">
			{BRAND.name}
		</h1>
		<p class="text-muted-foreground mt-2 text-center text-sm">{BRAND.tagline}</p>
	</SvaKoshCard>
</main>
