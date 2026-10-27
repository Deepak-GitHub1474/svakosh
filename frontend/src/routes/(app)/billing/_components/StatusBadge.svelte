<script lang="ts">
	import { STATUS_BADGE, STATUS_LABELS } from '$lib/billing/const';
	import type { TSubscriptionStatus } from '$lib/billing/types';

	let { status }: { status: TSubscriptionStatus } = $props();
</script>

<span class="inline-flex rounded px-2 py-1 text-xs font-semibold {STATUS_BADGE[status]}">
	{STATUS_LABELS[status]}
</span>
