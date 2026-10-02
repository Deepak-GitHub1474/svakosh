<script lang="ts">
	let { align, stacked = false }: { align: 'left' | 'right' | 'center'; stacked?: boolean } =
		$props();

	const alignment = {
		left: 'items-start',
		right: 'items-end',
		center: 'items-center'
	};
</script>

<span class="flex flex-col gap-0.5 {alignment[align]}">
	<span class="bg-foreground/10 block h-3.5 w-14 rounded"></span>
	{#if stacked}
		<span class="bg-foreground/10 block h-2.5 w-9 rounded"></span>
	{/if}
</span>
