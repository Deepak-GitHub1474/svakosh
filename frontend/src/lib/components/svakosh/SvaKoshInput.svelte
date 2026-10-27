<script lang="ts">
	import CloseIcon from '$lib/components/svg-provider/CloseIcon.svelte';
	import { cn } from '$lib/utils';

	let {
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		clearable = false,
		type = 'text',
		class: className = '',
		...rest
	} = $props();

	function handleFocus(e: FocusEvent) {
		const target = e.currentTarget as HTMLInputElement;
		target.select();
	}

	function clearInput() {
		value = '';
	}
</script>

<div class="relative w-full group">
	<input
		{type}
		{placeholder}
		{disabled}
		bind:value
		onfocus={handleFocus}
		class={cn(
			'glass-panel w-full rounded-lg p-3 text-[0.857rem] font-normal leading-tight text-foreground transition-all duration-200',
			'placeholder:text-muted-foreground placeholder:text-[0.857rem] placeholder:font-normal',
			'hover:border-primary/40 focus:border-primary/40 focus:outline-none',
			'disabled:cursor-not-allowed disabled:opacity-50 select-text',
			clearable && 'pr-10',
			className
		)}
		{...rest}
	/>

	{#if clearable && value && !disabled}
		<button
			type="button"
			onclick={clearInput}
			class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-white/10 transition-all duration-200"
			aria-label="Clear input"
		>
			<CloseIcon class="h-4 w-4" />
		</button>
	{/if}
</div>
