<script lang="ts">
	import GoogleIcon from '$lib/components/svg-provider/GoogleIcon.svelte';
	import { onMount, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { env } from '$env/dynamic/public';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import { toast } from '$lib/components/svakosh/toast.svelte';
	import { toastAuthResult } from '../_lib/helper';

	type Props = {
		redirectTo?: string;
		action?: string;
	};

	let { redirectTo = '', action = '?/googleAuth' }: Props = $props();

	type GoogleId = {
		accounts: {
			id: {
				initialize: (config: Record<string, unknown>) => void;
				renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
				prompt: () => void;
			};
		};
	};
	type WindowWithGoogle = Window & { google?: GoogleId };

	const GSI_SRC = 'https://accounts.google.com/gsi/client';
	const clientId = (env.PUBLIC_GOOGLE_CLIENT_ID ?? '').trim();

	const baseClass =
		'flex items-center justify-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] py-3.5 text-sm text-muted-foreground hover:text-white';

	let formRef: HTMLFormElement | null = $state(null);
	let overlayEl: HTMLDivElement | null = $state(null);
	let idToken = $state('');
	let loading = $state(false);

	async function handleCredential(response: { credential?: string }) {
		if (loading) return;
		if (!response?.credential) {
			toast.error({ description: 'Google sign-in failed. Try again.' });
			return;
		}
		loading = true;
		idToken = response.credential;
		await tick();
		formRef?.requestSubmit();
	}

	const onGoogleSubmit: SubmitFunction = () => async ({ update, result }) => {
		await update();
		loading = false;
		toastAuthResult(result);
	};

	function initGoogle() {
		const w = window as WindowWithGoogle;
		if (!w.google || !overlayEl) return;
		const fedcm = 'IdentityCredential' in window;
		w.google.accounts.id.initialize({
			client_id: clientId,
			callback: handleCredential,
			use_fedcm_for_prompt: fedcm,
			use_fedcm_for_button: fedcm
		});
		w.google.accounts.id.renderButton(overlayEl, {
			type: 'standard',
			theme: 'filled_black',
			size: 'large',
			text: 'continue_with',
			shape: 'rectangular',
			logo_alignment: 'center',
			width: 200
		});
		try {
			w.google.accounts.id.prompt();
		} catch {
			return;
		}
	}

	function loadGsi() {
		const w = window as WindowWithGoogle;
		if (w.google) {
			initGoogle();
			return;
		}
		const existing = document.querySelector<HTMLScriptElement>('script[data-gsi]');
		if (existing) {
			existing.addEventListener('load', initGoogle, { once: true });
			return;
		}
		const script = document.createElement('script');
		script.src = GSI_SRC;
		script.async = true;
		script.defer = true;
		script.dataset.gsi = '1';
		script.onload = initGoogle;
		script.onerror = () => toast.error({ description: 'Could not load Google sign-in.' });
		document.head.appendChild(script);
	}

	onMount(() => {
		if (!clientId) {
			toast.error({ description: 'Google sign-in is not configured.' });
			return;
		}
		loadGsi();
	});
</script>

<form
	bind:this={formRef}
	method="POST"
	{action}
	use:enhance={onGoogleSubmit}
	class="hidden"
>
	<input type="hidden" name="id_token" bind:value={idToken} />
	<input type="hidden" name="redirect" value={redirectTo} />
</form>

<div class="relative flex-1">
	<button type="button" class="{baseClass} w-full" aria-label="Continue with Google">
		<GoogleIcon />
		<span>Google</span>
	</button>
	{#if clientId}
		<div
			bind:this={overlayEl}
			class="absolute inset-0 z-10 flex items-center justify-center overflow-hidden opacity-[0.001]"
			aria-hidden="true"
		></div>
	{/if}
</div>

{#if loading}
	<SvaKoshLoader message="Signing you in…" />
{/if}
