<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		type = 'text',
		class: className = '',
		...rest
	} = $props();

	function handleFocus(e: FocusEvent) {
		const target = e.currentTarget as HTMLInputElement;
		target.select();
	}
</script>

<input
	{type}
	{placeholder}
	{disabled}
	bind:value
	onfocus={handleFocus}
	class={cn(
		'w-full bg-inherit rounded p-3 text-[0.857rem] font-normal leading-tight text-foreground shadow-sm',
		'placeholder:text-muted-foreground placeholder:text-[0.857rem] placeholder:font-normal',
		'border border-glass-border focus:border-primary focus:outline-none transition-all duration-200',
		'disabled:cursor-not-allowed disabled:opacity-50 select-text',
		className
	)}
	{...rest}
/>
