<script lang="ts">
	import type { TOtpErrorData } from '../_lib/types';

	type Props = {
		message?: string;
		error?: TOtpErrorData;
	};

	let { message = '', error = null }: Props = $props();

	function formatRetry(secs?: number | null): string {
		if (!secs || secs <= 0) return '';
		if (secs < 60) return `${secs} sec`;
		const min = Math.ceil(secs / 60);
		return `${min} min`;
	}

	const remaining = $derived(error?.attempts_remaining ?? null);
	const used = $derived(error?.attempts_used ?? null);
	const locked = $derived(Boolean(error?.locked || error?.code === 'OTP_LOCKED'));
	const retryStr = $derived(formatRetry(error?.retry_after_seconds));
	const isBlocked = $derived(Boolean(error?.is_blocked));
	const isNewUser = $derived(Boolean(error?.is_new_user));
</script>

{#if error || message}
	<div class="space-y-1.5 rounded-md border border-bearish/30 bg-bearish-subtle px-3 py-2.5 text-xs">
		<p class="text-bearish">
			{error?.message ?? message}
		</p>

		{#if isBlocked}
			<p class="text-bearish/80">
				Account permanently blocked. Contact support.
			</p>
		{:else if locked}
			<p class="text-bearish/80">
				{#if isNewUser}
					Too many wrong attempts. Try again in {retryStr || '15 min'}.
				{:else}
					Too many wrong attempts. Retry after {retryStr || '15 min'}.
				{/if}
			</p>
		{:else if remaining !== null && used !== null && used > 0}
			<p class="text-muted-foreground">
				Wrong attempts: <span class="text-bearish">{used}</span>
				· Remaining: <span class="text-foreground">{remaining}</span>
			</p>
		{/if}
	</div>
{/if}
