<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { env } from '$env/dynamic/public';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';

	type Props = {
		redirectTo?: string;
		action?: string;
		error?: string;
	};

	let { redirectTo = '', action = '?/googleAuth', error = $bindable('') }: Props = $props();

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
			error = 'Google sign-in failed. Try again.';
			return;
		}
		error = '';
		loading = true;
		idToken = response.credential;
		await tick();
		formRef?.requestSubmit();
	}

	const onGoogleSubmit: SubmitFunction = () => async ({ update }) => {
		await update();
		loading = false;
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
			error = '';
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
		script.onerror = () => (error = 'Could not load Google sign-in.');
		document.head.appendChild(script);
	}

	onMount(() => {
		if (!clientId) {
			error = 'Google sign-in is not configured.';
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
		<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
			/>
			<path
				fill="#FBBC05"
				d="M5.85 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.67-2.84Z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38Z"
			/>
		</svg>
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
