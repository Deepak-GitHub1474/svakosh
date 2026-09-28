<script lang="ts">
	import Icon from './Icon.svelte';
	import { calm, spotlight } from './utils';

	let {
		index,
		title,
		lead,
		body,
		route,
		icon
	}: {
		index: number;
		title: string;
		lead: string;
		body: string;
		route: string;
		icon: string;
	} = $props();

	const GLYPHS = '!<>-_\\/[]{}=+*^?#░▒▓';

	let card = $state<HTMLElement>();
	let scrambled = $state('');
	let typed = $state('');
	let frame = 0;

	function decode() {
		if (calm()) return;
		cancelAnimationFrame(frame);
		const start = performance.now();
		const step = (now: number) => {
			const progress = Math.min(1, (now - start) / 420);
			const settled = Math.floor(progress * title.length);
			scrambled = title
				.split('')
				.map((char, i) =>
					i < settled || char === ' ' ? char : GLYPHS[(Math.random() * GLYPHS.length) | 0]
				)
				.join('');
			if (progress < 1) frame = requestAnimationFrame(step);
			else scrambled = '';
		};
		frame = requestAnimationFrame(step);
	}

	$effect(() => {
		if (!card) return;
		if (calm()) {
			typed = route;
			return;
		}

		let typing = 0;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				observer.disconnect();
				const start = performance.now();
				const run = (now: number) => {
					const chars = Math.floor((now - start) / 36);
					typed = route.slice(0, chars);
					if (chars < route.length) typing = requestAnimationFrame(run);
				};
				typing = requestAnimationFrame(run);
			},
			{ threshold: 0.4 }
		);
		observer.observe(card);

		return () => {
			observer.disconnect();
			cancelAnimationFrame(typing);
			cancelAnimationFrame(frame);
		};
	});
</script>

<article
	bind:this={card}
	class="group spot reveal border-border-muted bg-surface/40 flex min-w-0 flex-col overflow-hidden rounded-2xl border p-5 md:p-6"
	onmouseenter={decode}
	role="presentation"
>
	<span
		class="ghost-num pointer-events-none absolute top-1 right-3 px-1 text-[100px] leading-none font-bold text-transparent select-none md:top-2 md:right-5 md:text-[120px]"
		aria-hidden="true"
	>
		{index + 1}
	</span>

	<span
		class="border-border-muted bg-primary/10 text-primary relative grid size-11 place-items-center rounded-xl border"
		aria-hidden="true"
	>
		<Icon path={icon} class="size-5" />
	</span>

	<h3 class="relative mt-5 text-xl font-semibold tracking-tight">{scrambled || title}</h3>
	<p class="relative mt-3 leading-relaxed">{lead}</p>
	<p class="text-muted-foreground relative mt-2 leading-relaxed">{body}</p>

	<p
		class="border-border-subtle text-muted-foreground relative mt-6 flex min-w-0 items-center gap-2 border-t pt-4 text-xs"
	>
		<span class="text-primary shrink-0">→</span>
		<span class="min-w-0 truncate">{typed}</span>
		<span class="animate-blink text-primary shrink-0 opacity-0 group-hover:opacity-100">▌</span>
	</p>
</article>
