<script lang="ts">
	import { TABLE } from '$lib/trade/const';
	import type { TBrokerAccount } from '$lib/trade/types';

	let { account }: { account: TBrokerAccount } = $props();
</script>

<td class={TABLE.td}>
	{account.account_tag || account.client_id}
	{#if account.account_tag}
		<span class="text-muted-foreground block text-xs">{account.client_id}</span>
	{/if}
</td>
