<script lang="ts">
	import logo from '$lib/assets/svakosh/logo.webp';
	import { BRAND } from '$lib/brand';
	import { cn } from '$lib/utils';

	let { class: className = '' }: { class?: string } = $props();
</script>

<img
	src={logo}
	alt={BRAND.name}
	width="128"
	height="128"
	draggable="false"
	class={cn('size-8 shrink-0 select-none', className)}
/>
