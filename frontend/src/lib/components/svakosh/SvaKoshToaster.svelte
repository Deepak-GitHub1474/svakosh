<script lang="ts">
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import SvaKoshToast from './SvaKoshToast.svelte';
	import { toastStore, type ToastPosition } from './toast.svelte';

	const POSITIONS: ToastPosition[] = [
		'top-right',
		'top-left',
		'top-center',
		'bottom-left',
		'bottom-center',
		'bottom-right'
	];

	const POSITION_CLASS: Record<ToastPosition, string> = {
		'top-right': 'top-4 right-4 items-end',
		'top-left': 'top-4 left-4 items-start',
		'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
		'bottom-left': 'bottom-4 left-4 items-start',
		'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
		'bottom-right': 'bottom-4 right-4 items-end'
	};
</script>

{#each POSITIONS as position (position)}
	{@const list = toastStore.items.filter((t) => t.position === position)}
	{#if list.length}
		<div
			class="pointer-events-none fixed z-[200] flex flex-col gap-2 {POSITION_CLASS[position]}"
		>
			{#each list as item (item.id)}
				<div
					class="pointer-events-auto"
					animate:flip={{ duration: 200 }}
					in:fly={{ y: position.startsWith('top') ? -16 : 16, duration: 200 }}
					out:fly={{ y: position.startsWith('top') ? -16 : 16, duration: 150 }}
				>
					<SvaKoshToast toast={item} onDismiss={(id) => toastStore.dismiss(id)} />
				</div>
			{/each}
		</div>
	{/if}
{/each}
