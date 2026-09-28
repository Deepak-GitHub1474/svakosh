<script lang="ts">
	let { value, change, align }: { value: string; change: number | null; align: 'left' | 'right' } =
		$props();
</script>

<span class="flex flex-col {align === 'left' ? 'items-start' : 'items-end'}">
	<span class="leading-tight">{value}</span>
	{#if change !== null}
		<span class="text-xs leading-tight {change >= 0 ? 'text-bullish' : 'text-bearish'}">
			{change >= 0 ? '+' : ''}{change.toFixed(2)}%
		</span>
	{:else}
		<span class="text-muted-foreground text-xs leading-tight">—</span>
	{/if}
</span>
