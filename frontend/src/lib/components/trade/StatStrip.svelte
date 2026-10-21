<script lang="ts">
	type Stat = { label: string; value: string; tone?: string };

	let { stats }: { stats: Stat[] } = $props();
</script>

<div class="mb-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
	{#each stats as stat (stat.label)}
		<div class="glass-panel rounded-xl px-4 py-3 sm:min-w-40">
			<p class="text-muted-foreground text-xs tracking-widest uppercase">{stat.label}</p>
			<p class="mt-1 text-lg tracking-tight {stat.tone ?? 'text-foreground'}">{stat.value}</p>
		</div>
	{/each}
</div>
