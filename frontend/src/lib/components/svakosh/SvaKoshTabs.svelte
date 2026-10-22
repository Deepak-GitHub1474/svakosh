<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	type Tab = {
		label: string;
		value: string;
		icon?: any;
		svgPath?: string;
	};

	interface Props {
		tabs: Tab[];
		activeTab: string;
		onTabChange: (value: any) => void;
		class?: string;
		ghostIcon?: any;
		svgPath?: string;
		ghostIconClass?: string;
	}

	let { 
		tabs, activeTab, onTabChange, 
		class: className = '',
		ghostIcon, svgPath, ghostIconClass = ''
	}: Props = $props();

	let containerRef: HTMLDivElement;
	let highlightStyle = $state({ width: '0px', left: '0px', opacity: 0 });
	let animate = $state(false);

	function updateHighlight() {
		if (!containerRef) return;
		const activeBtn = containerRef.querySelector(`[data-tab-value="${activeTab}"]`) as HTMLButtonElement;
		if (activeBtn) {
			highlightStyle = {
				width: `${activeBtn.offsetWidth}px`,
				left: `${activeBtn.offsetLeft}px`,
				opacity: 1
			};
		}
	}

	$effect(() => {
		activeTab;
		updateHighlight();
	});

	onMount(() => {
		const observer = new ResizeObserver(updateHighlight);
		observer.observe(containerRef);
		containerRef.querySelectorAll('[data-tab-value]').forEach((tab) => observer.observe(tab));
		updateHighlight();
		const frame = requestAnimationFrame(() => (animate = true));
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	});
</script>

<div 
	bind:this={containerRef}
	class={cn(
		'relative flex bg-surface/80 p-1 rounded-full border border-border-subtle backdrop-blur-md h-fit items-center overflow-hidden shadow-tab-track',
		className
	)}
>
	<div 
		class={cn(
			'absolute top-1 bottom-1 bg-gradient-to-b from-primary-light via-primary to-primary-dark rounded-full shadow-tab-pill',
			animate && 'transition-all duration-300 ease-out'
		)}
		style:width={highlightStyle.width}
		style:left={highlightStyle.left}
		style:opacity={highlightStyle.opacity}
	></div>

	{#each tabs as tab (tab.value)}
		<button
			type="button"
			data-tab-value={tab.value}
			onclick={() => onTabChange(tab.value)}
			class={cn(
				'relative z-10 px-4 py-2 rounded-full text-xs transition-colors duration-300 select-none font-semibold flex items-center gap-2 outline-none',
				activeTab === tab.value ? 'text-black' : 'text-muted-foreground hover:text-foreground'
			)}
		>
			<span>{tab.label}</span>
			{#if tab.icon}
				{@const Icon = tab.icon}
				<Icon class="h-3.5 w-3.5" />
			{:else if tab.svgPath}
				<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
					<path d={tab.svgPath} />
				</svg>
			{/if}
		</button>
	{/each}

	{#if ghostIcon || svgPath}
		<div
			class="pointer-events-none absolute right-0 bottom-0 p-1 opacity-5 transition-opacity group-hover:opacity-10"
			aria-hidden="true"
		>
			{#if ghostIcon}
				{@const Icon = ghostIcon}
				<Icon class={cn('h-8 w-8', ghostIconClass)} />
			{:else if svgPath}
				<svg class={cn('h-8 w-8', ghostIconClass)} fill="currentColor" viewBox="0 0 24 24">
					<path d={svgPath} />
				</svg>
			{/if}
		</div>
	{/if}
</div>
