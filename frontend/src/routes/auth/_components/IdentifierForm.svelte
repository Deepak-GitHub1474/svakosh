<script lang="ts">
	import MailIcon from '$lib/components/svg-provider/MailIcon.svelte';
	import LockIcon from '$lib/components/svg-provider/LockIcon.svelte';
	import UserIcon from '$lib/components/svg-provider/UserIcon.svelte';
	import { enhance } from '$app/forms';
	import { cn, safeSubmit } from '$lib/utils';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import type { TIdentifierForm } from '../_lib/types';
	import { toastAuthResult } from '../_lib/helper';
	import ArrowForward from '$lib/components/svg-provider/material/ArrowForward.svelte';

	let {
		action,
		label,
		placeholder,
		iconType,
		inputId,
		ctaLabel,
		redirectTo,
		autocomplete = 'username'
	}: TIdentifierForm = $props();

	let identifier = $state('');
	let submitting = $state(false);

	const isValid = $derived(identifier.trim().length > 0);
</script>

<form
	class="mt-8 space-y-4"
	method="POST"
	{action}
	use:enhance={safeSubmit((b) => (submitting = b), undefined, toastAuthResult)}
>
	<div>
		<label for={inputId} class="mb-1.5 block text-sm tracking-wide text-muted-foreground">
			{label}
		</label>
		<div class={cn('relative w-full')}>
			<span
				class="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/70"
				aria-hidden="true"
			>
				{#if iconType === 'mail'}
					<MailIcon />
				{:else if iconType === 'lock'}
					<LockIcon />
				{:else if iconType === 'user'}
					<UserIcon />
				{/if}
			</span>

			<SvaKoshInput
				id={inputId}
				type="text"
				{placeholder}
				{autocomplete}
				required
				bind:value={identifier}
				class="py-[13.5px] pl-10"
			/>
		</div>
	</div>

	<input type="hidden" name="identifier" value={identifier} />
	<input type="hidden" name="redirect" value={redirectTo} />

	<SvaKoshButton
		type="submit"
		variant="solid"
		disabled={submitting || !isValid}
		label={submitting ? 'Sending…' : ctaLabel}
		class="w-full py-3.5 text-sm"
	>
		{#snippet icon()}
			<ArrowForward class="icon-size" />
		{/snippet}
	</SvaKoshButton>
</form>
