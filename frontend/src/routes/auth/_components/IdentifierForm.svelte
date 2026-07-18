<script lang="ts">
	import { enhance } from '$app/forms';
	import { cn, safeSubmit } from '$lib/utils';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import OtpFeedback from './OtpFeedback.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import type { TIdentifierForm } from '../_lib/types';

	let {
		action,
		label,
		placeholder,
		iconType,
		inputId,
		ctaLabel,
		redirectTo,
		message,
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
	use:enhance={safeSubmit((b) => (submitting = b))}
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
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="5" width="18" height="14" rx="2" />
						<path d="m3 7 9 6 9-6" />
					</svg>
				{:else if iconType === 'lock'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
						<rect x="4" y="11" width="16" height="10" rx="2" />
						<path d="M8 11V8a4 4 0 0 1 8 0v3" />
					</svg>
				{:else if iconType === 'user'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="8" r="4" />
						<path d="M4 21a8 8 0 0 1 16 0" />
					</svg>
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

	{#if message}
		<OtpFeedback {message} />
	{/if}

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
			<span class="material-symbols-outlined icon-size">arrow_forward</span>
		{/snippet}
	</SvaKoshButton>
</form>
