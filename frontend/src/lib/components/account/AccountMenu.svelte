<script lang="ts">
	import { enhance } from '$app/forms';
	import SvaKoshSwitch from '$lib/components/svakosh/SvaKoshSwitch.svelte';
	import DarkMode from '$lib/components/svg-provider/material/DarkMode.svelte';
	import Logout from '$lib/components/svg-provider/material/Logout.svelte';
	import Person from '$lib/components/svg-provider/material/Person.svelte';
	import Settings from '$lib/components/svg-provider/material/Settings.svelte';

	interface Props {
		onNavigate?: () => void;
		compact?: boolean;
	}

	let { onNavigate, compact = true }: Props = $props();

	const row = $derived(
		`flex w-full items-center gap-3 px-3 ${compact ? 'py-2' : 'py-3'} text-xs rounded-md transition-all duration-200`
	);
</script>

<div class="flex items-center justify-between px-3 {compact ? 'py-2' : 'py-3'} text-xs text-muted-foreground">
	<div class="flex items-center gap-3">
		<DarkMode class="icon-size" />
		Dark Theme
	</div>
	<SvaKoshSwitch checked size="sm" />
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
	href="/settings"
	onclick={() => onNavigate?.()}
	class="{row} text-muted-foreground hover:bg-glass hover:text-foreground"
>
	<Settings class="icon-size" />
	Settings
</a>
<div class="h-[0.0625rem] bg-white/5 my-1 mx-2"></div>
<form
	method="POST"
	action="/auth/logout"
	use:enhance={() => {
		onNavigate?.();
		return async ({ update }) => {
			await update();
		};
	}}
>
	<button type="submit" class="{row} text-bearish/80 hover:bg-bearish-subtle hover:text-bearish group">
		<Logout class="icon-size" />
		Logout
	</button>
</form>
