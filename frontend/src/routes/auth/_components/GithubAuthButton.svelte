<script lang="ts">
	type Props = {
		onClick?: () => void;
	};

	let { onClick }: Props = $props();

	const baseClass =
		'flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] py-3.5 text-sm text-muted-foreground hover:text-white';
</script>

<button type="button" class={baseClass} onclick={onClick} aria-label="Continue with GitHub">
	<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path
			d="M12 1.5A10.5 10.5 0 0 0 1.5 12a10.5 10.5 0 0 0 7.18 9.97c.52.1.71-.23.71-.5v-1.76c-2.93.64-3.55-1.41-3.55-1.41-.48-1.22-1.17-1.55-1.17-1.55-.96-.66.07-.65.07-.65 1.06.07 1.62 1.09 1.62 1.09.94 1.62 2.47 1.15 3.07.88.1-.69.37-1.15.67-1.42-2.34-.27-4.8-1.17-4.8-5.2 0-1.15.41-2.09 1.08-2.83-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.88 1.08a9.97 9.97 0 0 1 5.24 0c2-1.36 2.88-1.08 2.88-1.08.57 1.45.21 2.52.1 2.79.67.74 1.08 1.68 1.08 2.83 0 4.04-2.46 4.93-4.81 5.19.38.33.72.97.72 1.96v2.91c0 .28.19.61.72.5A10.5 10.5 0 0 0 22.5 12 10.5 10.5 0 0 0 12 1.5Z"
		/>
	</svg>
	<span>GitHub</span>
</button>
