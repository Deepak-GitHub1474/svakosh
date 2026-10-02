<script lang="ts">
	let {
		side,
		strike,
		onorder
	}: {
		side: 'CE' | 'PE';
		strike: string;
		onorder: (side: 'CE' | 'PE', transaction: 'BUY' | 'SELL') => void;
	} = $props();

	const contract = $derived(side === 'CE' ? 'call' : 'put');
</script>

<button
	type="button"
	onclick={() => onorder(side, 'BUY')}
	class="absolute inset-0 lg:hidden"
	aria-label="Order {strike} {contract}"
></button>
