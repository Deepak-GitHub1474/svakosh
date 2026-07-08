<script lang="ts">
	import { symbolImageUrl, symbolInitial } from './index';

	interface Props {
		name: string;
		logoUrl?: string;
		class?: string;
	}

	let { name, logoUrl, class: className = '' }: Props = $props();

	const fallbackUrl = $derived(symbolImageUrl(name));
	const initial = $derived(symbolInitial(name));
	const src = $derived((logoUrl?.trim() || fallbackUrl) ?? '');

	let failed = $state(false);
	let lastSrc = '';

	$effect(() => {
		if (src !== lastSrc) {
			lastSrc = src;
			failed = false;
		}
	});
</script>

<div
	class="relative flex items-center justify-center overflow-hidden bg-black/40 border border-border-subtle rounded-full {className}"
	aria-label={name}
>
	{#if failed || !src}
		<span class="text-[0.625rem] text-primary uppercase">{initial}</span>
	{:else}
		<img
			{src}
			alt=""
			loading="lazy"
			decoding="async"
			draggable="false"
			onerror={() => (failed = true)}
			class="w-full h-full object-cover"
		/>
	{/if}
</div>
