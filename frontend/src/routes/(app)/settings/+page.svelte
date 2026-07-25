<script lang="ts">
	import { fade } from 'svelte/transition';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
</script>

<svelte:head>
	<title>Settings | SvaKosh</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl px-4 py-8" in:fade={{ duration: 200 }}>
	<SvaKoshCard>
		<div class="flex flex-col items-center justify-center gap-4 py-16 text-center">
			<span class="material-symbols-outlined text-primary" style="font-size: 3rem;">settings</span>
			<h1 class="text-lg font-semibold text-foreground">Settings</h1>
			<p class="text-sm text-muted-foreground">Coming soon.</p>
		</div>
	</SvaKoshCard>
</div>
