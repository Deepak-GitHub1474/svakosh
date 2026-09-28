<script lang="ts" generics="T extends { id: string; label: string }">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	let {
		items,
		slide,
		class: className = ''
	}: { items: readonly T[]; slide: Snippet<[T, number]>; class?: string } = $props();

	const SLOP = 8;

	let index = $state(0);
	let start = 0;
	let delta = $state(0);
	let pressed = false;
	let dragging = $state(false);

	function go(next: number) {
		index = Math.max(0, Math.min(items.length - 1, next));
	}

	function down(event: PointerEvent) {
		start = event.clientX;
		pressed = true;
		delta = 0;
	}

	function move(event: PointerEvent) {
		if (!pressed) return;
		const travel = event.clientX - start;
		if (!dragging) {
			if (Math.abs(travel) < SLOP) return;
			dragging = true;
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		}
		delta = travel;
	}

	function up(event: PointerEvent) {
		if (!pressed) return;
		const target = event.currentTarget as HTMLElement;
		if (dragging) {
			if (Math.abs(delta) > Math.min(90, target.clientWidth * 0.15)) {
				go(index + (delta < 0 ? 1 : -1));
			}
			if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
		}
		pressed = false;
		dragging = false;
		delta = 0;
	}

	function keys(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') go(index + 1);
		if (event.key === 'ArrowLeft') go(index - 1);
	}
</script>

<div
	class={cn('relative', className)}
	role="group"
	aria-roledescription="carousel"
	aria-label="Platform modules"
>
	<div
		class="h-[76svh] touch-pan-y overflow-hidden md:h-auto"
		role="presentation"
		tabindex="-1"
		onkeydown={keys}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
	>
		<div
			class="flex h-full md:h-auto"
			style="transform: translate3d(calc({-index * 100}% + {delta}px), 0, 0);
				transition: {dragging ? 'none' : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)'}"
		>
			{#each items as item, i (item.id)}
				<div
					class="flex h-full w-full shrink-0 px-0.5 transition-opacity duration-500 *:flex-1 md:h-auto"
					style="opacity: {i === index ? 1 : 0.4}"
					aria-hidden={i !== index}
					inert={i !== index}
				>
					{@render slide(item, i)}
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-3 flex items-center justify-center gap-4">
		<button
			type="button"
			onclick={() => go(index - 1)}
			disabled={index === 0}
			aria-label="Previous module"
			class="border-border-muted text-muted-foreground hover:border-primary/40 hover:text-primary grid size-10 place-items-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
		>
			<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
				<path d="M15 5 8 12l7 7 1.4-1.4L10.8 12l5.6-5.6z" />
			</svg>
		</button>

		<div class="flex items-center gap-2">
			{#each items as item, i (item.id)}
				<button
					type="button"
					onclick={() => go(i)}
					aria-label="Show {item.label}"
					aria-current={index === i}
					class="aria-[current=false]:bg-muted-foreground/35 aria-[current=true]:bg-primary h-1.5 rounded-full transition-all duration-300 aria-[current=false]:w-1.5 aria-[current=true]:w-7"
				></button>
			{/each}
		</div>

		<button
			type="button"
			onclick={() => go(index + 1)}
			disabled={index === items.length - 1}
			aria-label="Next module"
			class="border-border-muted text-muted-foreground hover:border-primary/40 hover:text-primary grid size-10 place-items-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
		>
			<svg viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true">
				<path d="M9 5 7.6 6.4 13.2 12l-5.6 5.6L9 19l7-7z" />
			</svg>
		</button>
	</div>
</div>
