<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import SvaKoshDrawer from '$lib/components/svakosh/SvaKoshDrawer.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import { SHEET_CONTEXT } from '$lib/trade/const';

	let {
		isOpen = $bindable(false),
		onClose,
		width = '22rem',
		children,
		footer
	}: {
		isOpen: boolean;
		onClose?: () => void;
		width?: string;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	let isDesktop = $state(true);

	setContext(SHEET_CONTEXT, {
		get drawer() {
			return !isDesktop;
		}
	});

	$effect(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		const sync = () => (isDesktop = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});
</script>

{#if isDesktop}
	<SvaKoshModal bind:isOpen {onClose} {width} {footer} class="overflow-hidden">
		{@render children()}
	</SvaKoshModal>
{:else}
	<SvaKoshDrawer
		bind:isOpen
		{onClose}
		showHandle={false}
		snapPoints={[10, 90]}
		{footer}
		class="overflow-hidden"
		contentClass={footer ? '' : 'pb-[env(safe-area-inset-bottom)]'}
	>
		{@render children()}
	</SvaKoshDrawer>
{/if}
