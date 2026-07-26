<script lang="ts">
	type Props = {
		message?: string;
	};

	let { message = 'Loading…' }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
	role="status"
	aria-live="polite"
	aria-busy="true"
>
	<span class="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></span>
	<p class="text-sm text-muted-foreground">{message}</p>
</div>
