<script lang="ts">
	type Stat = { label: string; value: string; tone?: string };

	let { stats, class: className = 'mb-4' }: { stats: Stat[]; class?: string } = $props();
</script>

<div class="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap {className}">
	{#each stats as stat (stat.label)}
		<div class="glass-panel rounded-xl px-4 py-3 sm:min-w-40">
			<p class="text-muted-foreground text-xs tracking-widest uppercase">{stat.label}</p>
			<p class="mt-1 text-lg tracking-tight tabular-nums {stat.tone ?? 'text-foreground'}">
				{stat.value}
			</p>
		</div>
	{/each}
</div>
