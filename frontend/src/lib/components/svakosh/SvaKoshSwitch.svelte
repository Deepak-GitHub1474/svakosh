<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		id?: string;
		label?: string;
		checked: boolean;
		onCheckedChange?: (val: boolean) => void;
		class?: string;
		disabled?: boolean;
	}

	let { 
		id, 
		label = 'Toggle switch',
		checked = $bindable(false), 
		onCheckedChange,
		class: className = '',
		disabled = false 
	}: Props = $props();

	function toggle() {
		if (disabled) return;
		checked = !checked;
		if (onCheckedChange) onCheckedChange(checked);
	}
</script>

<button
	{id}
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	{disabled}
	onclick={toggle}
	class={cn(
		'relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none',
		checked ? 'bg-primary' : 'bg-white/10',
		disabled && 'cursor-not-allowed opacity-50',
		className
	)}
>
	<span
		aria-hidden="true"
		class={cn(
			'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out',
			checked ? 'translate-x-5' : 'translate-x-0'
		)}
	></span>
</button>
