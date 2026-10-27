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

	const KEYBOARD_SETTLE_MS = 300;

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

	let keyboard = $state(0);
	let visibleHeight = $state(0);

	$effect(() => {
		const vv = window.visualViewport;
		if (!isOpen || !vv) return;
		const sync = () => {
			keyboard = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
			visibleHeight = vv.height;
		};
		sync();
		vv.addEventListener('resize', sync);
		vv.addEventListener('scroll', sync);
		return () => {
			vv.removeEventListener('resize', sync);
			vv.removeEventListener('scroll', sync);
			keyboard = 0;
		};
	});

	function revealField(e: FocusEvent) {
		const field = e.target;
		if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
		setTimeout(() => field.scrollIntoView({ block: 'nearest' }), KEYBOARD_SETTLE_MS);
	}

	const heightStyle = $derived.by(() => {
		const lift = keyboard ? `bottom:${keyboard}px;` : '';
		const cap = keyboard ? `min(${maxVh}vh, ${Math.floor(visibleHeight * 0.95)}px)` : `${maxVh}vh`;
		if (dragging && liveHeight !== null) {
			return `${lift}height:${liveHeight}px;max-height:${cap};`;
		}
		if (draggable) {
			return `${lift}height:${points[snapIdx] ?? minVh}vh;max-height:${cap};`;
		}
		return `${lift}min-height:${keyboard ? 0 : minVh}vh;max-height:${cap};`;
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
			class={cn('fixed inset-0 z-[1120] bg-black/50', backdropClass)}
			transition:fade={{ duration: 200 }}
		></button>
	{/if}

	<div
		bind:this={panelEl}
		role="dialog"
		aria-modal="true"
		style={heightStyle}
		onfocusin={revealField}
		class={cn(
			'fixed inset-x-0 bottom-0 z-[1130] flex flex-col',
			'border-surface-border bg-surface rounded-t-2xl border-t',
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
			<div class="border-border-subtle flex shrink-0 items-center gap-3 border-b px-4 pb-3">
				{#if icon}
					<div
						class="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
					>
						{@render icon()}
					</div>
				{/if}
				{#if title}
					<div class="flex min-w-0 flex-col">
						{#if typeof title === 'string'}
							<span class="text-foreground truncate text-base font-medium">{title}</span>
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
						class="text-muted-foreground hover:text-foreground ml-auto shrink-0 cursor-pointer transition-colors"
					>
						<CloseIcon class="h-5 w-5" />
					</button>
				{/if}
			</div>
		{/if}

		<div
			class={cn(
				'hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain',
				!footer && 'pb-[max(1rem,env(safe-area-inset-bottom))]',
				contentClass
			)}
		>
			{@render children()}
		</div>

		{#if footer}
			<div
				class="border-border-subtle shrink-0 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
			>
				{@render footer()}
			</div>
		{/if}
	</div>
{/if}
