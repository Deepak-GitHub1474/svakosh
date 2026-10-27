<script lang="ts">
	import { BRAND } from '$lib/brand';
	import { cn } from '$lib/utils';
	import SvaKoshLogo from '$lib/components/svakosh/SvaKoshLogo.svelte';

	let { class: className = '' }: { class?: string } = $props();
</script>

<div class={cn('flex items-start gap-3 select-none', className)}>
	<SvaKoshLogo class="size-12" />
	<div class="flex flex-col leading-snug">
		<span class="text-foreground text-lg font-semibold tracking-wider">{BRAND.name}</span>
		<span class="text-muted-foreground text-sm tracking-wider">
			{BRAND.tagline}
		</span>
	</div>
</div>
