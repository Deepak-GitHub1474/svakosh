<script lang="ts">
	import { formatSigned } from '../_lib/helper';

	let {
		spot,
		change,
		changePercent,
		columns
	}: { spot: number; change: number; changePercent: number; columns: number } = $props();

	const rule = 'h-0.5 flex-1';
</script>

<tr aria-hidden="true">
	<td colspan={columns} class="p-0">
		<div class="flex h-6 items-center">
			<span class="{rule} bg-[linear-gradient(to_left,var(--foreground),var(--background))]"></span>

			<span
				class="bg-foreground text-background flex h-6 items-center gap-1.5 rounded-full px-4 text-xs tabular-nums"
			>
				<span class="font-semibold">{spot.toFixed(2)}</span>
				<span>{formatSigned(change)} ({Math.abs(changePercent).toFixed(2)}%)</span>
			</span>

			<span class="{rule} bg-[linear-gradient(to_right,var(--foreground),var(--background))]"
			></span>
		</div>
	</td>
</tr>
