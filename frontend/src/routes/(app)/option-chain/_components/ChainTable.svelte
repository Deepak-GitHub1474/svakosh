<script lang="ts">
	import ChainRow from './ChainRow.svelte';
	import SkeletonBar from './SkeletonBar.svelte';
	import SpotMarkerRow from './SpotMarkerRow.svelte';
	import { GREEK_COLUMNS, OI_COLUMNS, STRIKE_COLUMN_WIDTH, TABLE_BOTTOM_GAP } from '../_lib/const';
	import { chain } from '../_lib/state.svelte';
	import { spotMarkerIndex } from '../_lib/helper';
	import type { TColumn, TStrikeData } from '../_lib/types';

	let {
		onorder
	}: { onorder: (strike: string, side: 'CE' | 'PE', transaction: 'BUY' | 'SELL') => void } =
		$props();

	const flipAlign = (column: TColumn): TColumn => ({
		...column,
		align: column.align === 'left' ? 'right' : 'left'
	});

	const isOiView = $derived(chain.view === 'OI');
	const callColumns = $derived(isOiView ? OI_COLUMNS : GREEK_COLUMNS);
	const putColumns = $derived([...callColumns].reverse().map(flipAlign));
	const strikeColumnWidth = $derived(STRIKE_COLUMN_WIDTH[chain.view]);
	const skeletonRows = $derived(chain.range * 2 + 1);
	const columnCount = $derived(callColumns.length * 2 + 1);
	const markerIndex = $derived(spotMarkerIndex(chain.strikes, chain.data?.spot_ltp));

	const emptyStrike: TStrikeData = {};

	let scroller = $state<HTMLElement>();
	let availableHeight = $state(0);
	let measuredHeight = 0;
	let centredKey = '';

	$effect(() => {
		const host = scroller;
		if (!host) return;

		const measure = () => {
			const next = window.innerHeight - host.getBoundingClientRect().top - TABLE_BOTTOM_GAP;
			if (Math.abs(next - measuredHeight) < 1) return;
			measuredHeight = next;
			availableHeight = next;
		};

		measure();

		const observer = new ResizeObserver(measure);
		if (host.parentElement) observer.observe(host.parentElement);
		window.addEventListener('resize', measure);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', measure);
		};
	});

	$effect(() => {
		const host = scroller;
		if (!host || chain.loading) return;

		const key = `${chain.symbol}:${chain.expiry}:${chain.range}`;
		if (key === centredKey) return;
		centredKey = key;

		const frame = requestAnimationFrame(() => {
			const row = host.querySelector('[data-atm]');
			const header = host.querySelector('thead');
			if (!row) return;

			const hostBox = host.getBoundingClientRect();
			const rowBox = row.getBoundingClientRect();
			const headerHeight = header?.getBoundingClientRect().height ?? 0;
			const visibleHeight = hostBox.height - headerHeight;

			host.scrollTop +=
				rowBox.top - hostBox.top - headerHeight - (visibleHeight - rowBox.height) / 2;
		});

		return () => cancelAnimationFrame(frame);
	});

	const headerCell = 'bg-surface cursor-help px-3 py-2.5 font-normal whitespace-nowrap';
	const skeletonCell = 'border-border-subtle/60 border-b px-3 py-2';
</script>

<div
	bind:this={scroller}
	class="border-border-subtle hide-scrollbar overflow-auto rounded-lg border"
	style={availableHeight > 0 ? `max-height: ${availableHeight}px` : undefined}
>
	<table
		class="w-full table-fixed border-separate border-spacing-0 {isOiView
			? 'lg:min-w-[48rem]'
			: 'min-w-[72rem]'}"
	>
		<colgroup>
			{#each callColumns as column (column.label)}
				<col style="width: {column.width}%" />
			{/each}
			<col style="width: {strikeColumnWidth}%" />
			{#each putColumns as column (column.label)}
				<col style="width: {column.width}%" />
			{/each}
		</colgroup>

		<thead class="sticky top-0 z-20 shadow-[0_0.0625rem_0_0_var(--border-subtle)]">
			<tr class="text-muted-foreground text-xs">
				{#each callColumns as column (column.label)}
					<th
						title="Call · {column.hint}"
						class="{headerCell} {column.align === 'left' ? 'text-left' : 'text-right'}"
					>
						{column.label}
					</th>
				{/each}

				<th
					title="Strike price of the contract"
					class="border-x-border-muted bg-surface border-x px-4 py-2.5 text-center font-normal"
				>
					Strike
				</th>

				{#each putColumns as column (column.label)}
					<th
						title="Put · {column.hint}"
						class="{headerCell} {column.align === 'left' ? 'text-left' : 'text-right'}"
					>
						{column.label}
					</th>
				{/each}
			</tr>
		</thead>

		{#if chain.loading}
			<tbody class="animate-pulse">
				{#each { length: skeletonRows } as _, index (index)}
					<tr class="last:[&>td]:border-b-0">
						{#each callColumns as column (column.label)}
							<td class={skeletonCell}>
								<SkeletonBar align={column.align} stacked={isOiView} />
							</td>
						{/each}

						<td
							class="border-x-border-muted border-b-border-subtle/60 bg-background/40 border-x border-b px-4 py-2"
						>
							<SkeletonBar align="center" />
						</td>

						{#each putColumns as column (column.label)}
							<td class={skeletonCell}>
								<SkeletonBar align={column.align} stacked={isOiView} />
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		{:else}
			<tbody>
				{#each chain.strikes as strike, index (strike)}
					{#if index === markerIndex && chain.data}
						<SpotMarkerRow
							spot={chain.data.spot_ltp}
							change={chain.data.spot_change}
							changePercent={chain.data.spot_change_pct}
							columns={columnCount}
						/>
					{/if}

					<ChainRow
						{strike}
						data={chain.data?.options_data[strike] ?? emptyStrike}
						greeks={chain.greeks[strike]}
						view={chain.view}
						atm={chain.atm}
						onorder={(side, transaction) => onorder(strike, side, transaction)}
					/>
				{/each}

				{#if markerIndex === chain.strikes.length && chain.data}
					<SpotMarkerRow
						spot={chain.data.spot_ltp}
						change={chain.data.spot_change}
						changePercent={chain.data.spot_change_pct}
						columns={columnCount}
					/>
				{/if}
			</tbody>
		{/if}
	</table>
</div>
