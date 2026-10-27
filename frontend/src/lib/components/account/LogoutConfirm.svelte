<script lang="ts">
	import { enhance } from '$app/forms';
	import { uiState } from '$lib/store/ui.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import { MODAL_ACTION, MODAL_ACTIONS } from '$lib/trade/const';

	let loggingOut = $state(false);
</script>

{#snippet actions()}
	<div class={MODAL_ACTIONS}>
		<SvaKoshButton
			variant="secondary"
			label="Cancel"
			class={MODAL_ACTION}
			disabled={loggingOut}
			onclick={() => {
				uiState.isLogoutConfirmOpen = false;
			}}
		/>
		<SvaKoshButton
			type="submit"
			form="logout-form"
			variant="bearish"
			label={loggingOut ? 'Logging out…' : 'Logout'}
			class={MODAL_ACTION}
			disabled={loggingOut}
		/>
	</div>
{/snippet}

<SvaKoshModal
	bind:isOpen={uiState.isLogoutConfirmOpen}
	title="Log out of Svakosh?"
	showClose
	footer={actions}
	class="z-[1160]"
	backdropClass="z-[1150]"
>
	<form
		id="logout-form"
		method="POST"
		action="/auth/logout"
		class="p-4"
		use:enhance={() => {
			loggingOut = true;
			return async ({ update }) => {
				await update();
				loggingOut = false;
				uiState.isLogoutConfirmOpen = false;
			};
		}}
	>
		<p class="text-muted-foreground text-sm">You will need to sign in again to continue.</p>
	</form>
</SvaKoshModal>
