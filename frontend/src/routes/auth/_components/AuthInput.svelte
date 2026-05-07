<script lang="ts">
	import { cn } from '$lib/utils';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';

	type IconType = 'mail' | 'lock' | 'user';

	type Props = {
		id?: string;
		type?: 'text' | 'email' | 'password';
		value?: string;
		placeholder?: string;
		icon: IconType;
		class?: string;
		autocomplete?: HTMLInputElement['autocomplete'];
		required?: boolean;
	};

	let {
		id,
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		icon,
		class: className = '',
		autocomplete,
		required = false
	}: Props = $props();

	let revealed = $state(false);
	const isPassword = $derived(type === 'password');
	const effectiveType = $derived(isPassword && revealed ? 'text' : type);
</script>

<div class={cn('relative w-full', className)}>
	<span
		class="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/70"
		aria-hidden="true"
	>
		{#if icon === 'mail'}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="5" width="18" height="14" rx="2" />
				<path d="m3 7 9 6 9-6" />
			</svg>
		{:else if icon === 'lock'}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
				<rect x="4" y="11" width="16" height="10" rx="2" />
				<path d="M8 11V8a4 4 0 0 1 8 0v3" />
			</svg>
		{:else if icon === 'user'}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="8" r="4" />
				<path d="M4 21a8 8 0 0 1 16 0" />
			</svg>
		{/if}
	</span>

	<SvaKoshInput
		{id}
		type={effectiveType}
		{placeholder}
		{autocomplete}
		{required}
		bind:value
		class={isPassword ? 'pl-10 pr-10' : 'pl-10'}
	/>

	{#if isPassword}
		<button
			type="button"
			onclick={() => (revealed = !revealed)}
			class="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/70 transition-colors hover:text-foreground"
			aria-label={revealed ? 'Hide password' : 'Show password'}
		>
			{#if revealed}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
					<path d="M2 12s3.5-7 10-7c2 0 3.7.5 5.2 1.3M22 12s-3.5 7-10 7c-2 0-3.7-.5-5.2-1.3" />
					<path d="m3 3 18 18" />
					<path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
				</svg>
			{:else}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
					<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
			{/if}
		</button>
	{/if}
</div>
