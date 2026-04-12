<script lang="ts">
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
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	{/if}
</div>
