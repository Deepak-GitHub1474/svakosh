<script lang="ts">
	import GoogleAuthButton from './GoogleAuthButton.svelte';
	import PasskeyButton from './PasskeyButton.svelte';

	let { redirectTo = '' }: { redirectTo?: string } = $props();
</script>

<div class="flex w-full gap-3">
	<GoogleAuthButton {redirectTo} />
	<PasskeyButton {redirectTo} />
</div>
