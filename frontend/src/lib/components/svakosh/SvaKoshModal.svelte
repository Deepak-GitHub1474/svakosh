<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type ModalPosition = 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'dropdown';

	let {
		isOpen = $bindable(false),
		onClose,
		title,
		icon,
		class: className = '',
		children,
		width = '28rem',
		position = 'center',
		showBackdrop = true,
		backdropClass = ''
	}: {
		isOpen: boolean;
		onClose?: () => void;
		title?: string | Snippet;
		icon?: Snippet;
		class?: string;
		children: Snippet;
		width?: string;
		position?: ModalPosition;
		showBackdrop?: boolean;
		backdropClass?: string;
	} = $props();

	function handleClose() {
		isOpen = false;
		onClose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			handleClose();
		}
	}

	const positionClasses: Record<ModalPosition, string> = {
		center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
		'top-right': 'right-6 top-12',
		'top-left': 'left-6 top-12',
		'bottom-right': 'right-6 bottom-12',
		'bottom-left': 'left-6 bottom-12',
		dropdown: 'absolute'
	};

	const transitionParams = $derived(
		position === 'center'
			? { duration: 200, y: 8 } 
			: { y: -10, duration: 200 }
	);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	{#if showBackdrop}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class={cn('fixed inset-0 z-[100] bg-black/50', backdropClass)}
			transition:fade={{ duration: 150 }}
			onclick={handleClose}
		></div>
	{/if}

	<div
		role="dialog"
		aria-modal="true"
		class={cn(
			'fixed z-[110] flex flex-col',
			'rounded-lg border border-border-subtle bg-background',
			'shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)]',
			positionClasses[position],
			className
		)}
		style="width: {width}; max-width: calc(100vw - 2rem); max-height: calc(100vh - 2rem);"
		transition:fly={transitionParams}
	>
		{#if title || icon}
			<div class="flex items-center gap-3 p-4 border-b border-border-subtle shrink-0">
				{#if icon}
					<div
						class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"
					>
						{@render icon()}
					</div>
				{/if}
				{#if title}
					<div class="flex flex-col min-w-0">
						{#if typeof title === 'string'}
							<span class="text-sm text-foreground truncate">{title}</span>
						{:else}
							{@render title()}
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex-1 min-h-0 overflow-y-auto">
			{@render children()}
		</div>
	</div>
{/if}
