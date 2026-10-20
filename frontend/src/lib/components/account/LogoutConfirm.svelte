<script lang="ts">
	import { enhance } from '$app/forms';
	import { uiState } from '$lib/store/ui.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';

	let loggingOut = $state(false);
</script>

<SvaKoshModal
	bind:isOpen={uiState.isLogoutConfirmOpen}
	title="Log out of Svakosh?"
	showClose
	class="z-[1160]"
	backdropClass="z-[1150]"
>
	<form
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
		<div class="mt-12 flex justify-end gap-3">
			<SvaKoshButton
				variant="secondary"
				label="Cancel"
				disabled={loggingOut}
				onclick={() => {
					uiState.isLogoutConfirmOpen = false;
				}}
			/>
			<SvaKoshButton
				type="submit"
				variant="bearish"
				label={loggingOut ? 'Logging out…' : 'Logout'}
				disabled={loggingOut}
			/>
		</div>
	</form>
</SvaKoshModal>
