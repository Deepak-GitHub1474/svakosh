<script lang="ts">
	import GoogleAuthButton from './GoogleAuthButton.svelte';
	import GithubAuthButton from './GithubAuthButton.svelte';

	type Props = {
		redirectTo?: string;
		serverMessage?: string;
		onGithub?: () => void;
	};

	let { redirectTo = '', serverMessage = '', onGithub }: Props = $props();

	let googleError = $state('');
	const message = $derived(googleError || serverMessage);
</script>

<div class="flex w-full gap-3">
	<GoogleAuthButton {redirectTo} bind:error={googleError} />
	<GithubAuthButton onClick={onGithub} />
</div>

{#if message}
	<p class="mt-2 text-center text-xs text-bearish">{message}</p>
{/if}
