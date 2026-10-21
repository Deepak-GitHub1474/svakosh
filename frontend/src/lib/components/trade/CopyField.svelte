<script lang="ts">
	import { onDestroy } from 'svelte';

	let { label, value }: { label: string; value: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1500);
	}

	onDestroy(() => clearTimeout(timer));
</script>

<div class="border-border-subtle bg-background flex items-center gap-3 rounded-lg border px-3 py-2">
	<div class="min-w-0 flex-1">
		<p class="text-muted-foreground text-xs">{label}</p>
		<p class="text-foreground truncate text-sm select-all">{value}</p>
	</div>
	<button
		type="button"
		onclick={copy}
		class="shrink-0 text-xs tracking-wider uppercase transition-colors {copied
			? 'text-bullish'
			: 'text-primary hover:text-foreground'}"
	>
		{copied ? 'Copied' : 'Copy'}
	</button>
</div>
