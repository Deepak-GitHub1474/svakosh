<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		icon?: string;
		actionLabel?: string;
		actionIcon?: string;
		onAction?: () => void;
		children?: Snippet;
		class?: string;
	}

	let {
		title,
		description,
		icon,
		actionLabel,
		actionIcon,
		onAction,
		children,
		class: className = ''
	}: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center h-full p-6 text-center gap-3 {className}"
>
	{#if icon}
		<div
			class="flex items-center justify-center w-14 h-14 rounded-full bg-primary-subtle border border-primary/20"
		>
			<span class="material-symbols-outlined text-primary" style="font-size:1.75rem">
				{icon}
			</span>
		</div>
	{/if}

	<div class="flex flex-col gap-1 w-full">
		<p class="text-sm text-foreground">{title}</p>
		{#if description}
			<p class="text-[0.625rem] text-muted-foreground break-words">{description}</p>
		{/if}
	</div>

	{#if children}
		{@render children()}
	{:else if actionLabel}
		<button
			type="button"
			onclick={onAction}
			class="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs text-primary bg-primary-subtle border border-primary/20 hover:bg-primary-hover cursor-pointer transition-colors"
		>
			{#if actionIcon}
				<span class="material-symbols-outlined" style="font-size:0.875rem">{actionIcon}</span>
			{/if}
			{actionLabel}
		</button>
	{/if}
</div>
