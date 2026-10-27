<script lang="ts">
	import GithubIcon from '$lib/components/svg-provider/GithubIcon.svelte';
	type Props = {
		onClick?: () => void;
	};

	let { onClick }: Props = $props();

	const baseClass =
		'flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] py-3.5 text-sm text-muted-foreground hover:text-white';
</script>

<button type="button" class={baseClass} onclick={onClick} aria-label="Continue with GitHub">
	<GithubIcon />
	<span>GitHub</span>
</button>
