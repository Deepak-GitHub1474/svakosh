<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cn } from '$lib/utils';
	import CloseIcon from '$lib/components/svg-provider/CloseIcon.svelte';

	let {
		isOpen = $bindable(false),
		onClose,
		title,
		icon,
		children,
		footer,
		class: className = '',
		contentClass = '',
		backdropClass = '',
		showBackdrop = true,
		showClose = false,
		showHandle = true,
		closeOnBackdrop = true,
		closeOnEscape = true,
		lockScroll = true,
		draggable = false,
		snapPoints = [40, 60, 85],
		initialSnap = 0,
		dismissOnDragDown = true
	}: {
		isOpen: boolean;
		onClose?: () => void;
		title?: string | Snippet;
		icon?: Snippet;
		children: Snippet;
		footer?: Snippet;
		class?: string;
		contentClass?: string;
		backdropClass?: string;
		showBackdrop?: boolean;
		showClose?: boolean;
		showHandle?: boolean;
		closeOnBackdrop?: boolean;
		closeOnEscape?: boolean;
		lockScroll?: boolean;
		draggable?: boolean;
		snapPoints?: number[];
		initialSnap?: number;
		dismissOnDragDown?: boolean;
	} = $props();

	const points = $derived(
		[...new Set(snapPoints)].filter((p) => p > 0 && p <= 100).sort((a, b) => a - b)
	);
	const minVh = $derived(points[0] ?? 40);
	const maxVh = $derived(points[points.length - 1] ?? 85);

	let panelEl = $state<HTMLDivElement>();
	let snapIdx = $state(0);
	let dragging = $state(false);
	let liveHeight = $state<number | null>(null);
	let dragStartY = 0;
	let dragStartHeight = 0;

	$effect(() => {
		if (isOpen) {
			snapIdx = Math.min(Math.max(initialSnap, 0), points.length - 1);
			liveHeight = null;
			dragging = false;
		}
	});

	$effect(() => {
		if (!isOpen || !lockScroll) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	const heightStyle = $derived.by(() => {
		if (dragging && liveHeight !== null) {
			return `height:${liveHeight}px;max-height:${maxVh}vh;`;
		}
		if (draggable) {
			return `height:${points[snapIdx] ?? minVh}vh;max-height:${maxVh}vh;`;
		}
		return `min-height:${minVh}vh;max-height:${maxVh}vh;`;
	});

	function close() {
		isOpen = false;
		onClose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (closeOnEscape && e.key === 'Escape' && isOpen) close();
	}

	function handleBackdrop() {
		if (closeOnBackdrop) close();
	}

	function onPointerDown(e: PointerEvent) {
		if (!draggable || !panelEl) return;
		dragging = true;
		dragStartY = e.clientY;
		dragStartHeight = panelEl.getBoundingClientRect().height;
		liveHeight = dragStartHeight;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		const maxPx = (maxVh / 100) * window.innerHeight;
		liveHeight = Math.min(maxPx, Math.max(0, dragStartHeight + (dragStartY - e.clientY)));
	}

	function onPointerUp() {
		if (!dragging) return;
		dragging = false;
		const height = liveHeight ?? dragStartHeight;
		const vh = (height / window.innerHeight) * 100;
		liveHeight = null;

		if (dismissOnDragDown && vh < minVh * 0.6) {
			close();
			return;
		}

		let best = 0;
		points.forEach((p, i) => {
			if (Math.abs(p - vh) < Math.abs(points[best] - vh)) best = i;
		});
		snapIdx = best;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	{#if showBackdrop}
		<button
			type="button"
			aria-label="Close"
			onclick={handleBackdrop}
			class={cn('fixed inset-0 z-[1120] bg-black/60 backdrop-blur-sm', backdropClass)}
			transition:fade={{ duration: 200 }}
		></button>
	{/if}

	<div
		bind:this={panelEl}
		role="dialog"
		aria-modal="true"
		style={heightStyle}
		class={cn(
			'fixed inset-x-0 bottom-0 z-[1130] flex flex-col',
			'rounded-t-2xl border-t border-surface-border bg-surface',
			'shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.6)]',
			dragging ? 'transition-none' : 'transition-[height] duration-300 ease-out',
			className
		)}
		transition:fly={{ y: 400, duration: 300, easing: cubicOut }}
	>
		{#if showHandle}
			<div
				role="presentation"
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onpointercancel={onPointerUp}
				class="flex shrink-0 justify-center pt-3 pb-2 {draggable
					? 'cursor-grab touch-none active:cursor-grabbing'
					: ''}"
			>
				<div class="h-1 w-10 rounded-full bg-white/15"></div>
			</div>
		{/if}

		{#if title || icon || showClose}
			<div class="flex shrink-0 items-center gap-3 border-b border-border-subtle px-4 pb-3">
				{#if icon}
					<div
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						{@render icon()}
					</div>
				{/if}
				{#if title}
					<div class="flex min-w-0 flex-col">
						{#if typeof title === 'string'}
							<span class="truncate text-sm text-foreground">{title}</span>
						{:else}
							{@render title()}
						{/if}
					</div>
				{/if}
				{#if showClose}
					<button
						type="button"
						onclick={close}
						aria-label="Close"
						class="ml-auto shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
					>
						<CloseIcon class="h-5 w-5" />
					</button>
				{/if}
			</div>
		{/if}

		<div
			class={cn(
				'min-h-0 flex-1 overflow-y-auto overscroll-contain hide-scrollbar',
				!footer && 'pb-[max(1rem,env(safe-area-inset-bottom))]',
				contentClass
			)}
		>
			{@render children()}
		</div>

		{#if footer}
			<div
				class="shrink-0 border-t border-border-subtle px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
			>
				{@render footer()}
			</div>
		{/if}
	</div>
{/if}
