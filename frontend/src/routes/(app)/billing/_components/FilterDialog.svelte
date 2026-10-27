<script lang="ts">
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import SvaKoshDrawer from '$lib/components/svakosh/SvaKoshDrawer.svelte';
	import SvaKoshModal from '$lib/components/svakosh/SvaKoshModal.svelte';
	import {
		DEFAULT_PLAN_FILTER,
		DEFAULT_STATUS_FILTER,
		PLAN_FILTERS,
		RADIO,
		STATUS_FILTERS
	} from '$lib/billing/const';
	import type { TPlanFilter, TStatusFilter } from '$lib/billing/types';
	import { MODAL_ACTION, MODAL_ACTIONS } from '$lib/trade/const';

	let {
		isOpen = $bindable(false),
		isDesktop,
		status,
		plan,
		onApply
	}: {
		isOpen: boolean;
		isDesktop: boolean;
		status: TStatusFilter;
		plan: TPlanFilter;
		onApply: (status: TStatusFilter, plan: TPlanFilter) => void;
	} = $props();

	let draftStatus = $derived(status);
	let draftPlan = $derived(plan);

	function apply() {
		isOpen = false;
		onApply(draftStatus, draftPlan);
	}
</script>

{#snippet group<T extends string>(
	name: string,
	label: string,
	options: { label: string; value: T }[],
	value: T,
	select: (v: T) => void
)}
	<fieldset>
		<legend class="text-muted-foreground mb-3 text-xs">{label}</legend>
		<div class="flex flex-wrap gap-x-6 gap-y-3">
			{#each options as option (option.value)}
				<label class="text-foreground flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="radio"
						{name}
						class={RADIO}
						checked={value === option.value}
						onchange={() => select(option.value)}
					/>
					{option.label}
				</label>
			{/each}
		</div>
	</fieldset>
{/snippet}

{#snippet fields()}
	<div class="flex flex-col gap-6">
		{@render group('plan', 'Plan', PLAN_FILTERS, draftPlan, (v) => (draftPlan = v))}
		{@render group('status', 'Status', STATUS_FILTERS, draftStatus, (v) => (draftStatus = v))}
	</div>
{/snippet}

{#snippet actions()}
	<div class={MODAL_ACTIONS}>
		<SvaKoshButton
			variant="secondary"
			label="Reset"
			class="border-transparent {MODAL_ACTION}"
			onclick={() => {
				draftStatus = DEFAULT_STATUS_FILTER;
				draftPlan = DEFAULT_PLAN_FILTER;
			}}
		/>
		<SvaKoshButton
			variant="solid"
			label="Apply"
			class="border-transparent {MODAL_ACTION}"
			onclick={apply}
		/>
	</div>
{/snippet}

{#if isDesktop}
	<SvaKoshModal bind:isOpen title="Filter subscriptions" showClose footer={actions}>
		<div class="p-4">
			{@render fields()}
		</div>
	</SvaKoshModal>
{:else}
	<SvaKoshDrawer
		bind:isOpen
		title="Filter subscriptions"
		showClose
		footer={actions}
		contentClass="p-4"
	>
		{@render fields()}
	</SvaKoshDrawer>
{/if}
