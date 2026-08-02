<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import PasskeyIcon from '$lib/components/svg-provider/material/PasskeyIcon.svelte';

	type Props = {
		redirectTo?: string;
		action?: string;
		error?: string;
	};

	let { redirectTo = '', action = '?/passkeyAuth', error = $bindable('') }: Props = $props();

	let formRef: HTMLFormElement | null = $state(null);
	let challengeId = $state('');
	let credential = $state('');
	let loading = $state(false);

	const baseClass =
		'flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] py-3.5 text-sm text-muted-foreground hover:text-white';

	async function onClick() {
		if (loading) return;
		error = '';
		loading = true;
		try {
			const beginRes = await fetch('/api/passkey/auth/begin', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{}'
			});
			const beginJson = await beginRes.json().catch(() => ({}));
			if (!beginRes.ok || !beginJson?.success) {
				throw new Error(beginJson?.message ?? 'Could not start passkey sign-in.');
			}

			const { startAuthentication } = await import('@simplewebauthn/browser');
			const assertion = await startAuthentication({ optionsJSON: beginJson.data.options });

			challengeId = beginJson.data.challenge_id;
			credential = JSON.stringify(assertion);
			await tick();
			formRef?.requestSubmit();
		} catch (e) {
			loading = false;
			if (e instanceof Error && (e.name === 'NotAllowedError' || e.name === 'AbortError')) return;
			error = e instanceof Error && e.message ? e.message : 'Passkey sign-in failed. Try again.';
		}
	}

	const onPasskeySubmit: SubmitFunction = () => async ({ update }) => {
		await update();
		loading = false;
	};
</script>

<form bind:this={formRef} method="POST" {action} use:enhance={onPasskeySubmit} class="hidden">
	<input type="hidden" name="challenge_id" value={challengeId} />
	<input type="hidden" name="credential" value={credential} />
	<input type="hidden" name="redirect" value={redirectTo} />
</form>

<button type="button" onclick={onClick} class={baseClass} aria-label="Sign in with a passkey">
	<PasskeyIcon style="font-size: 1.125rem;" />
	<span>Passkey</span>
</button>

{#if loading}
	<SvaKoshLoader message="Signing you in…" />
{/if}
