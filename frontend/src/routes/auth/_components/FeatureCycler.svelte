<script lang="ts">
	import { fly } from 'svelte/transition';

	type Props = {
		features: string[];
		intervalMs?: number;
	};

	let { features, intervalMs = 2800 }: Props = $props();
	let current = $state(0);

	$effect(() => {
		if (features.length <= 1) return;
		const id = setInterval(() => {
			current = (current + 1) % features.length;
		}, intervalMs);
		return () => clearInterval(id);
	});
</script>

{#if features.length}
	<div class="relative h-6 min-w-[10rem]">
		{#key current}
			<div
				in:fly={{ y: -14, duration: 380 }}
				out:fly={{ y: 14, duration: 320 }}
				class="absolute inset-0 flex items-center gap-2.5"
			>
				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-[#08090a]"
				>
					{current + 1}
				</span>
				<span class="whitespace-nowrap text-sm tracking-wide text-primary">
					{features[current]}
				</span>
			</div>
		{/key}
	</div>
{/if}
