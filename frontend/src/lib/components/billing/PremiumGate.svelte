<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import AwardStar from '$lib/components/svg-provider/material/AwardStar.svelte';
	import { PLAN_CODES } from '$lib/billing/const';
	import { openPage } from '$lib/billing/helper';

	let { feature, title, children }: { feature: string; title: string; children: Snippet } =
		$props();

	const allowed = $derived(
		page.data.user?.role === 'admin' || !!page.data.entitlements?.features.includes(feature)
	);
</script>

{#if allowed}
	{@render children()}
{:else}
	<EmptyState
		class="min-h-[60vh]"
		icon={AwardStar}
		title="{title} is part of Premium Analytics"
		description="Subscribe to Premium Analytics to unlock {title} and every other premium tool. Your first month is free."
		actionLabel="See Premium Analytics"
		onAction={() => openPage(resolve('/pricing'), { plan: PLAN_CODES.analytics })}
	/>
{/if}
