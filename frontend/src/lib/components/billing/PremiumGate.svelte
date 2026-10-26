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
		title="{title} is a Premium tool"
		description="Upgrade to SvaKosh Premium to unlock {title} and every other premium analytics tool."
		actionLabel="See Premium plans"
		onAction={() => openPage(resolve('/pricing'), { plan: PLAN_CODES.analytics })}
	/>
{/if}
