<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import SvaKoshLoader from '$lib/components/svakosh/SvaKoshLoader.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import type { Passkey, PasskeyResult } from '../_lib/types';
	import { PASSKEY_COLUMNS } from '../_lib/const';
	import {
		deleteAllPasskeys,
		deletePasskey,
		deviceIcon,
		formatDate,
		registerPasskey,
		timeAgo
	} from '../_lib/helper';

	let { passkeys = [] }: { passkeys?: Passkey[] } = $props();

	let loading = $state(false);
	let error = $state('');
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let confirmAction: (() => Promise<PasskeyResult>) | null = $state(null);

	async function run(action: () => Promise<PasskeyResult>) {
		if (loading) return;
		error = '';
		loading = true;
		try {
			const result = await action();
			if (result.ok) await invalidateAll();
			else if (result.message) error = result.message;
		} finally {
			loading = false;
		}
	}

	function askRemove(id: string) {
		confirmTitle = 'Remove this passkey?';
		confirmMessage = 'This device will no longer be able to sign in with this passkey.';
		confirmAction = () => deletePasskey(id);
		confirmOpen = true;
	}

	function askRemoveAll() {
		if (!passkeys.length) return;
		confirmTitle = 'Remove all passkeys?';
		confirmMessage = 'This removes all passkeys from every device. You can add them again anytime.';
		confirmAction = deleteAllPasskeys;
		confirmOpen = true;
	}

	function confirmYes() {
		const action = confirmAction;
		confirmOpen = false;
		confirmAction = null;
		if (action) run(action);
	}
</script>

<div class="glass-panel overflow-hidden rounded-xl">
	<div class="flex justify-end px-4 pt-4">
		<SvaKoshButton
			variant="solid"
			label="Add Passkey"
			onclick={() => run(registerPasskey)}
			disabled={loading}
			class="shrink-0"
		/>
	</div>

	{#if error}
		<div class="mx-4 mt-4 rounded-md border border-bearish-muted bg-bearish-subtle px-3 py-2.5 text-sm text-bearish">
			{error}
		</div>
	{/if}

	{#if passkeys.length}
		<div class="mt-4 overflow-x-auto px-4">
			<table class="w-full min-w-[36rem] border-collapse text-left">
				<thead>
					<tr class="border-b border-border-subtle text-muted">
						{#each PASSKEY_COLUMNS as col (col.label)}
							<th class="py-3 font-normal text-sm! {col.class}">{col.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each passkeys as pk (pk.credential_id)}
						<tr class="border-b border-border-subtle/50 last:border-0">
							<td class="py-4 pr-4">
								<div class="flex items-center gap-3">
									<span class="material-symbols-outlined text-muted-foreground" style="font-size: 1.25rem;">
										{deviceIcon(pk.device_name)}
									</span>
									<span class="text-xs text-foreground">{pk.device_name || 'Passkey'}</span>
								</div>
							</td>
							<td class="py-4 pr-4 text-xs text-muted-foreground">{formatDate(pk.created_at)}</td>
							<td class="py-4 pr-4 text-xs text-muted-foreground">{timeAgo(pk.last_used_at)}</td>
							<td class="py-4 text-right">
								<button
									type="button"
									onclick={() => askRemove(pk.credential_id)}
									disabled={loading}
									aria-label="Remove passkey"
									class="text-muted-foreground transition-colors hover:text-bearish disabled:opacity-50"
								>
									<span class="material-symbols-outlined" style="font-size: 1.125rem;">delete</span>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<button
			type="button"
			onclick={askRemoveAll}
			disabled={loading}
			class="mt-2 flex w-full items-center justify-between gap-3 border-t border-border-subtle p-4 text-left transition-colors hover:bg-bearish-subtle disabled:opacity-50"
		>
			<div class="flex items-center gap-3">
				<span class="material-symbols-outlined text-bearish" style="font-size: 1.25rem;">delete_forever</span>
				<div>
					<p class="text-sm font-semibold text-bearish">Remove All Devices</p>
					<p class="text-xs text-muted-foreground">Remove all passkeys from all devices</p>
				</div>
			</div>
			<span class="material-symbols-outlined text-muted-foreground" style="font-size: 1.25rem;">chevron_right</span>
		</button>
	{:else}
		<div class="m-4 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-subtle px-4 py-10 text-center">
			<span class="material-symbols-outlined text-primary" style="font-size: 2rem;">passkey</span>
			<div>
				<p class="text-sm text-muted-foreground">No passkeys yet.</p>
				<p class="mt-1 text-xs text-muted-foreground">Add one to sign in faster next time.</p>
			</div>
		</div>
	{/if}
</div>

{#if loading}
	<SvaKoshLoader message="Please wait…" />
{/if}

<SvaKoshModal bind:isOpen={confirmOpen} title={confirmTitle} showClose>
	<div class="p-4">
		<p class="text-sm text-muted-foreground">{confirmMessage}</p>
		<div class="mt-12 flex justify-end gap-3">
			<SvaKoshButton
				variant="secondary"
				label="Cancel"
				onclick={() => {
					confirmOpen = false;
				}}
			/>
			<SvaKoshButton variant="bearish" label="Remove" onclick={confirmYes} />
		</div>
	</div>
</SvaKoshModal>

