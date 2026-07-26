<script lang="ts">
	import { fade } from 'svelte/transition';
	import PassKey from './_components/PassKey.svelte';
	import Themes from './_components/Themes.svelte';
	import { SETTINGS_TABS } from './_lib/const';
	import type { Passkey, SettingsTab } from './_lib/types';

	let { data } = $props();

	let active = $state<SettingsTab['id']>('passkeys');
	const activeSubtitle = $derived(SETTINGS_TABS.find((t) => t.id === active)?.subtitle ?? '');
</script>

<svelte:head>
	<title>Settings | SvaKosh</title>
</svelte:head>

<div class="w-full py-2" in:fade={{ duration: 200 }}>
	<header class="mb-6">
		<h1 class="mb-1 text-2xl tracking-tight text-primary">Settings</h1>
		<p class="text-sm text-muted-foreground">{activeSubtitle}</p>
	</header>

	<div class="mb-6 flex gap-6 overflow-x-auto border-b border-border-subtle">
		{#each SETTINGS_TABS as tab (tab.id)}
			<button
				type="button"
				onclick={() => (active = tab.id)}
				class="flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm transition-colors {active === tab.id
					? 'border-primary font-semibold text-primary'
					: 'border-transparent text-muted-foreground hover:text-foreground'}"
			>
				<span class="material-symbols-outlined" style="font-size: 1.125rem;">{tab.icon}</span>
				{tab.label}
			</button>
		{/each}
	</div>

	{#if active === 'passkeys'}
		<PassKey passkeys={data.passkeys as Passkey[]} />
	{:else if active === 'themes'}
		<Themes />
	{/if}
</div>
