<script lang="ts">
	type Stat = { label: string; short?: string; value: string; compact?: string; tone?: string };

	let { stats, class: className = 'mb-4' }: { stats: Stat[]; class?: string } = $props();
</script>

<div
	class="grid gap-2 sm:flex sm:flex-wrap sm:gap-3 {stats.length === 3
		? 'grid-cols-3'
		: 'grid-cols-2'} {className}"
>
	{#each stats as stat (stat.label)}
		<div class="glass-panel min-w-0 rounded-xl px-3 py-2.5 sm:min-w-40 sm:px-4 sm:py-3">
			<p class="text-muted-foreground truncate text-xs tracking-widest uppercase">
				<span class="sm:hidden">{stat.short ?? stat.label}</span>
				<span class="hidden sm:inline">{stat.label}</span>
			</p>
			<p
				class="mt-1 truncate text-base tracking-tight tabular-nums sm:text-lg {stat.tone ??
					'text-foreground'}"
			>
				<span class="sm:hidden">{stat.compact ?? stat.value}</span>
				<span class="hidden sm:inline">{stat.value}</span>
			</p>
		</div>
	{/each}
</div>
