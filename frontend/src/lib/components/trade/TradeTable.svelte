<script lang="ts">
	import type { Snippet } from 'svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import { TABLE, TABLE_EMPTY } from '$lib/trade/const';

	type Props = {
		head: Snippet;
		body: Snippet;
		empty: boolean;
		loading: boolean;
		error: string;
		emptyTitle: string;
		emptyDescription: string;
		onRetry: () => void;
	};

	let { head, body, empty, loading, error, emptyTitle, emptyDescription, onRetry }: Props =
		$props();
</script>

<div class="{TABLE.wrap} flex flex-col">
	<table class={TABLE.table}>
		<thead class={TABLE.thead}>
			<tr class={TABLE.head}>{@render head()}</tr>
		</thead>
		{#if !empty}
			<tbody>{@render body()}</tbody>
		{/if}
	</table>
	{#if empty}
		<div class="sticky left-0 flex w-full flex-1 items-center justify-center">
			{#if loading}
				<SvaKoshLoader inline message="" />
			{:else if error}
				<EmptyState
					class={TABLE_EMPTY}
					title="Could not load"
					description={error}
					actionLabel="Retry"
					onAction={onRetry}
				/>
			{:else}
				<EmptyState class={TABLE_EMPTY} title={emptyTitle} description={emptyDescription} />
			{/if}
		</div>
	{/if}
</div>
