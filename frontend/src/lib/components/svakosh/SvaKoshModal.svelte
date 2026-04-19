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
		width = '18.75rem',
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
		center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-0',
		'top-right': 'right-6 top-12',
		'top-left': 'left-6 top-12',
		'bottom-right': 'right-6 bottom-12',
		'bottom-left': 'left-6 bottom-12',
		dropdown: 'absolute'
	};

	const transitionParams = $derived(
		position === 'center' 
			? { duration: 200, scale: 0.95 } 
			: { y: -10, duration: 200 }
	);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	{#if showBackdrop}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class={cn(
				'fixed inset-0 z-[100]',
				backdropClass
			)}
			transition:fade={{ duration: 150 }}
			onclick={handleClose}
		></div>
	{/if}

	<div
		class={cn(
			'fixed z-[110] flex flex-col',
			'rounded-xl border-t border-l border-white/20 border-b border-r border-black/60',
			'bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] backdrop-blur-xl',
			'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9),0_0_20px_rgba(255,255,255,0.05)]',
			'animate-in fade-in duration-200',
			positionClasses[position],
			className
		)}
		style="width: {width};"
		transition:fly={transitionParams}
	>
		{#if title || icon}
			<div class="flex items-center gap-3 p-4 border-b border-border-subtle">
				{#if icon}
					<div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
						{@render icon()}
					</div>
				{/if}
				{#if title}
					<div class="flex flex-col">
						{#if typeof title === 'string'}
							<span class="text-xs font-medium text-white">{title}</span>
						{:else}
							{@render title()}
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		<div class="p-1">
			{@render children()}
		</div>
	</div>
{/if}
