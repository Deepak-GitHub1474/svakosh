<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import { cn } from '$lib/utils';
	import CloseIcon from '$lib/components/svg-provider/CloseIcon.svelte';
	import Info from '$lib/components/svg-provider/Info.svelte';
	import CheckCircleIcon from '$lib/components/svg-provider/CheckCircleIcon.svelte';
	import ErrorIcon from '$lib/components/svg-provider/ErrorIcon.svelte';
	import WarningIcon from '$lib/components/svg-provider/WarningIcon.svelte';
	import type { ToastItem } from './toast.svelte';

	let { toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void } = $props();

	const CONFIG: Record<
		ToastItem['type'],
		{ icon: Component<{ class?: string }>; color: string; container: string; chip: string }
	> = {
		message: {
			icon: Info,
			color: 'text-foreground',
			container: 'border-border-subtle bg-surface',
			chip: 'bg-foreground text-background'
		},
		success: {
			icon: CheckCircleIcon,
			color: 'text-bullish',
			container: 'border-bullish/30 bg-bullish/10',
			chip: 'bg-bullish text-background'
		},
		error: {
			icon: ErrorIcon,
			color: 'text-bearish',
			container: 'border-bearish/30 bg-bearish/10',
			chip: 'bg-bearish text-background'
		},
		warning: {
			icon: WarningIcon,
			color: 'text-primary',
			container: 'border-primary/30 bg-primary/10',
			chip: 'bg-primary text-background'
		}
	};

	const Icon = $derived(CONFIG[toast.type].icon);
	const color = $derived(CONFIG[toast.type].color);
	const container = $derived(CONFIG[toast.type].container);
	const chip = $derived(CONFIG[toast.type].chip);

	onMount(() => {
		if (toast.duration <= 0) return;
		const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
		return () => clearTimeout(timer);
	});
</script>

<div
	role="status"
	aria-live="polite"
	class={cn(
		'relative flex min-h-16 w-[calc(100vw-2rem)] max-w-[360px] gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm sm:w-auto sm:min-w-[360px] sm:max-w-[390px]',
		container
	)}
>
	<Icon class={cn('mt-0.5 h-5 w-5 shrink-0', color)} />

	<div class="flex min-w-0 flex-1 flex-col gap-1">
		{#if toast.title}
			<p class={cn('text-base font-semibold', color)}>{toast.title}</p>
		{/if}
		{#if toast.description}
			<p class={cn('text-sm font-normal break-words', color)}>{toast.description}</p>
		{/if}
		{#if toast.action}
			<div class="mt-1 flex justify-end">
				<button
					type="button"
					onclick={() => {
						toast.action?.onClick();
						onDismiss(toast.id);
					}}
					class={cn('text-sm font-medium transition-opacity hover:opacity-80', color)}
				>
					{toast.action.label}
				</button>
			</div>
		{/if}
	</div>

	<button
		type="button"
		onclick={() => onDismiss(toast.id)}
		aria-label="Close"
		class={cn(
			'absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full transition-opacity hover:opacity-80',
			chip
		)}
	>
		<CloseIcon class="h-3 w-3" />
	</button>
</div>
