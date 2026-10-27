<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import SvaKoshSwitch from '$lib/components/svakosh/SvaKoshSwitch.svelte';
	import DarkMode from '$lib/components/svg-provider/material/DarkMode.svelte';
	import Logout from '$lib/components/svg-provider/material/Logout.svelte';
	import CardMembership from '$lib/components/svg-provider/material/CardMembership.svelte';
	import Person from '$lib/components/svg-provider/material/Person.svelte';
	import Settings from '$lib/components/svg-provider/material/Settings.svelte';
	import SwapVert from '$lib/components/svg-provider/material/SwapVert.svelte';

	interface Props {
		onNavigate?: () => void;
		compact?: boolean;
	}

	let { onNavigate, compact = true }: Props = $props();

	let confirming = $state(false);

	const row = $derived(
		`flex w-full items-center gap-3 px-3 ${compact ? 'py-2' : 'py-3'} text-xs rounded-md transition-all duration-200`
	);
</script>

<div class="flex items-center justify-between px-3 {compact ? 'py-2' : 'py-3'} text-xs text-muted-foreground">
	<div class="flex items-center gap-3">
		<DarkMode class="icon-size" />
		Dark Theme
	</div>
	<SvaKoshSwitch checked size="sm" disabled label="Light theme coming soon" />
</div>
<div class="h-[0.0625rem] bg-white/5 my-1 mx-2"></div>
<a
	href="/profile"
	onclick={() => onNavigate?.()}
	class="{row} text-muted-foreground hover:bg-glass hover:text-foreground"
>
	<Person class="icon-size" />
	Profile
</a>
<a
	href={resolve('/billing')}
	onclick={() => onNavigate?.()}
	class="{row} text-muted-foreground hover:bg-glass hover:text-foreground"
>
	<CardMembership class="icon-size" />
	Subscription
</a>
<a
	href={resolve('/broker/accounts')}
	onclick={() => onNavigate?.()}
	class="{row} text-muted-foreground hover:bg-glass hover:text-foreground"
>
	<SwapVert class="icon-size" />
	Broker accounts
</a>
<a
	href="/settings"
	onclick={() => onNavigate?.()}
	class="{row} text-muted-foreground hover:bg-glass hover:text-foreground"
>
	<Settings class="icon-size" />
	Settings
</a>
<div class="h-[0.0625rem] bg-white/5 my-1 mx-2"></div>
<button
	type="button"
	aria-expanded={confirming}
	class="{row} text-bearish/80 hover:bg-bearish-subtle hover:text-bearish group"
	onclick={() => (confirming = !confirming)}
>
	<Logout class="icon-size" />
	Logout
</button>
{#if confirming}
	<form
		method="POST"
		action="/auth/logout"
		class="flex flex-col gap-2.5 px-3 pt-1 pb-2"
		transition:slide={{ duration: 200, easing: cubicOut }}
		use:enhance={() => {
			onNavigate?.();
			return async ({ update }) => {
				await update();
			};
		}}
	>
		<p class="text-xs text-muted-foreground">Log out of Svakosh?</p>
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => (confirming = false)}
				class="flex-1 rounded-md border border-border-subtle py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="flex-1 rounded-md border border-bearish/30 bg-bearish-subtle py-1.5 text-xs text-bearish transition-colors hover:bg-bearish/20"
			>
				Logout
			</button>
		</div>
	</form>
{/if}
