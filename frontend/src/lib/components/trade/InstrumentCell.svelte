<script lang="ts">
	import type { Snippet } from 'svelte';
	import { TABLE } from '$lib/trade/const';
	import { instrumentNames, plainSymbol } from '$lib/trade/names.svelte';

	let { token, symbol, children }: { token?: string; symbol: string; children?: Snippet } =
		$props();

	const name = $derived(token ? instrumentNames.names[token] : undefined);
</script>

<td class={TABLE.td}>
	<span class="text-foreground font-medium">{name?.trading_symbol ?? plainSymbol(symbol)}</span>
	{@render children?.()}
	{#if name?.company_name}
		<span class="text-muted-foreground block text-xs">{name.company_name}</span>
	{/if}
</td>
