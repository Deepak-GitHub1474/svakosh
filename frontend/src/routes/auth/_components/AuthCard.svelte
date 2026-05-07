<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Props = {
		illustration: Snippet;
		form: Snippet;
		reverse?: boolean;
	};

	let { illustration, form, reverse = false }: Props = $props();
</script>

<div
	class="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#101216]"
>
	<div class="grid grid-cols-1 lg:grid-cols-2">
		<div class={cn('h-full', reverse ? 'lg:order-2' : '')}>
			{@render illustration()}
		</div>
		<div class="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
			<div class="w-full max-w-[26rem]">
				{@render form()}
			</div>
		</div>
	</div>
</div>
