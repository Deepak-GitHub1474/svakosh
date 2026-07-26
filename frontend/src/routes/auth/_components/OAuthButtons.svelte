<script lang="ts">
	import GoogleAuthButton from './GoogleAuthButton.svelte';
	import PasskeyButton from './PasskeyButton.svelte';

	type Props = {
		redirectTo?: string;
		googleMessage?: string;
		passkeyMessage?: string;
	};

	let { redirectTo = '', googleMessage = '', passkeyMessage = '' }: Props = $props();

	let googleError = $state('');
	let passkeyError = $state('');
	const message = $derived(googleError || passkeyError || googleMessage || passkeyMessage);
</script>

<div class="flex w-full gap-3">
	<GoogleAuthButton {redirectTo} bind:error={googleError} />
	<PasskeyButton {redirectTo} bind:error={passkeyError} />
</div>

{#if message}
	<p class="mt-2 text-center text-xs text-bearish">{message}</p>
{/if}
