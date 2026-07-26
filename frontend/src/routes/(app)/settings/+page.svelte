<script lang="ts">
	import { fade } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';

	type Passkey = {
		credential_id: string;
		device_name: string | null;
		created_at: string | null;
		last_used_at: string | null;
	};

	let { data } = $props();

	const passkeys = $derived((data.passkeys ?? []) as Passkey[]);
	let loading = $state(false);
	let error = $state('');

	function formatDate(iso: string | null): string {
		if (!iso) return '—';
		const d = new Date(iso);
		return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
	}

	function deviceLabel(): string {
		if (typeof navigator === 'undefined') return 'Passkey';
		const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
		return nav.userAgentData?.platform || nav.platform || 'This device';
	}

	async function addPasskey() {
		if (loading) return;
		error = '';
		loading = true;
		try {
			const beginRes = await fetch('/api/passkey/register/begin', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{}'
			});
			const beginJson = await beginRes.json().catch(() => ({}));
			if (!beginRes.ok || !beginJson?.success) {
				throw new Error(beginJson?.message ?? 'Could not start passkey setup.');
			}

			const { startRegistration } = await import('@simplewebauthn/browser');
			const attestation = await startRegistration({ optionsJSON: beginJson.data });

			const completeRes = await fetch('/api/passkey/register/complete', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ credential: attestation, device_name: deviceLabel() })
			});
			const completeJson = await completeRes.json().catch(() => ({}));
			if (!completeRes.ok || !completeJson?.success) {
				throw new Error(completeJson?.message ?? 'Failed to add passkey.');
			}
			await invalidateAll();
		} catch (e) {
			if (e instanceof Error && (e.name === 'NotAllowedError' || e.name === 'AbortError')) return;
			error = e instanceof Error && e.message ? e.message : 'Failed to add passkey.';
		} finally {
			loading = false;
		}
	}

	async function removePasskey(id: string) {
		if (loading) return;
		error = '';
		loading = true;
		try {
			const res = await fetch(`/api/passkey/${encodeURIComponent(id)}`, { method: 'DELETE' });
			const json = await res.json().catch(() => ({}));
			if (!res.ok || !json?.success) throw new Error(json?.message ?? 'Failed to remove passkey.');
			await invalidateAll();
		} catch (e) {
			error = e instanceof Error && e.message ? e.message : 'Failed to remove passkey.';
		} finally {
			loading = false;
		}
	}

	async function removeAll() {
		if (loading || !passkeys.length) return;
		if (!confirm('Remove all passkeys from every device? You can add them again anytime.')) return;
		error = '';
		loading = true;
		try {
			const res = await fetch('/api/passkey/remove-all', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{}'
			});
			const json = await res.json().catch(() => ({}));
			if (!res.ok || !json?.success) throw new Error(json?.message ?? 'Failed to remove passkeys.');
			await invalidateAll();
		} catch (e) {
			error = e instanceof Error && e.message ? e.message : 'Failed to remove passkeys.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Settings | SvaKosh</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl px-4 py-8" in:fade={{ duration: 200 }}>
	<h1 class="mb-6 text-lg font-semibold text-foreground">Settings</h1>

	<SvaKoshCard>
		<div class="flex flex-col gap-5">
			<div class="flex items-start justify-between gap-4">
				<div class="flex items-start gap-3">
					<span class="material-symbols-outlined text-primary" style="font-size: 1.5rem;">passkey</span>
					<div>
						<h2 class="text-sm font-semibold text-foreground">Passkeys</h2>
						<p class="mt-0.5 text-xs text-muted-foreground">
							Sign in with your fingerprint, face, or device PIN — no OTP needed.
						</p>
					</div>
				</div>
				<SvaKoshButton variant="primary" label="Add passkey" onclick={addPasskey} disabled={loading} />
			</div>

			{#if error}
				<div class="rounded-md border border-bearish-muted bg-bearish-subtle px-3 py-2.5 text-xs text-bearish">
					{error}
				</div>
			{/if}

			{#if passkeys.length}
				<ul class="flex flex-col divide-y divide-border-subtle rounded-lg border border-border-subtle">
					{#each passkeys as pk (pk.credential_id)}
						<li class="flex items-center justify-between gap-3 px-4 py-3">
							<div class="flex items-center gap-3">
								<span class="material-symbols-outlined text-muted-foreground" style="font-size: 1.25rem;">
									fingerprint
								</span>
								<div>
									<p class="text-sm text-foreground">{pk.device_name || 'Passkey'}</p>
									<p class="text-xs text-muted-foreground">
										Added {formatDate(pk.created_at)} · Last used {formatDate(pk.last_used_at)}
									</p>
								</div>
							</div>
							<button
								type="button"
								onclick={() => removePasskey(pk.credential_id)}
								disabled={loading}
								aria-label="Remove passkey"
								class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-glass hover:text-bearish disabled:opacity-50"
							>
								<span class="material-symbols-outlined" style="font-size: 1.125rem;">delete</span>
							</button>
						</li>
					{/each}
				</ul>

				<div class="flex justify-end">
					<SvaKoshButton
						variant="bearish"
						label="Remove all devices"
						onclick={removeAll}
						disabled={loading}
					/>
				</div>
			{:else}
				<div class="rounded-lg border border-dashed border-border-subtle px-4 py-8 text-center">
					<p class="text-sm text-muted-foreground">No passkeys yet.</p>
					<p class="mt-1 text-xs text-muted-foreground">Add one to sign in faster next time.</p>
				</div>
			{/if}
		</div>
	</SvaKoshCard>
</div>

{#if loading}
	<SvaKoshLoader message="Please wait…" />
{/if}
