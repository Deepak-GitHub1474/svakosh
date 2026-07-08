<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		showNote: boolean;
		showMenu: boolean;
		hasNote: boolean;
		menuOpen?: boolean;
		onNote?: () => void;
		onRemove?: () => Promise<void> | void;
	}

	let {
		showNote,
		showMenu,
		hasNote,
		menuOpen = $bindable(false),
		onNote,
		onRemove
	}: Props = $props();
	let openUp = $state(false);
	let triggerEl = $state<HTMLButtonElement>();
	let removing = $state(false);

	function toggleMenu(e: MouseEvent) {
		e.stopPropagation();
		if (!menuOpen && triggerEl) {
			const rect = triggerEl.getBoundingClientRect();
			openUp = window.innerHeight - rect.bottom < 120;
		}
		menuOpen = !menuOpen;
	}

	function handleClickOutside(node: HTMLElement) {
		function onClick(e: MouseEvent) {
			if (menuOpen && !node.contains(e.target as Node)) menuOpen = false;
		}
		document.addEventListener('mousedown', onClick);
		return {
			destroy() {
				document.removeEventListener('mousedown', onClick);
			}
		};
	}

	async function handleRemove(e: MouseEvent) {
		e.stopPropagation();
		if (removing) return;
		menuOpen = false;
		removing = true;
		try {
			await onRemove?.();
		} finally {
			removing = false;
		}
	}

	function handleNote(e: MouseEvent) {
		e.stopPropagation();
		onNote?.();
	}
</script>

<div use:handleClickOutside class="relative flex items-center gap-1.5">
	{#if showNote}
		<button
			type="button"
			onclick={handleNote}
			aria-label={hasNote ? 'Edit note' : 'Add note'}
			title={hasNote ? 'Edit note' : 'Add note'}
			class="w-7 h-7 flex items-center justify-center rounded border cursor-pointer transition-colors
			{hasNote
				? 'bg-primary-subtle border-primary/30 text-primary'
				: 'bg-glass border-border-subtle text-muted-foreground hover:text-primary hover:border-primary/30'}"
		>
			<span class="material-symbols-outlined" style="font-size:0.875rem">sticky_note_2</span>
		</button>
	{/if}

	{#if showMenu}
		<button
			bind:this={triggerEl}
			type="button"
			onclick={toggleMenu}
			aria-label="More actions"
			title="More"
			class="w-7 h-7 flex items-center justify-center rounded bg-glass border border-border-subtle text-muted-foreground hover:text-primary hover:border-primary/30 cursor-pointer transition-colors
			{menuOpen ? 'text-primary border-primary/30' : ''}"
		>
			<span class="material-symbols-outlined" style="font-size:0.875rem">more_vert</span>
		</button>

		{#if menuOpen}
			<div
				transition:fade={{ duration: 100 }}
				class="absolute right-0 z-50 w-36 rounded-lg border border-border-subtle bg-background shadow-[0_10px_20px_-5px_rgba(0,0,0,0.6)] p-1
				{openUp ? 'bottom-full mb-1' : 'top-full mt-1'}"
				role="menu"
			>
				<button
					type="button"
					onclick={handleRemove}
					disabled={removing}
					class="flex w-full items-center gap-3 px-3 py-2 text-xs text-bearish/80 hover:bg-bearish-subtle hover:text-bearish rounded-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 text-left"
					role="menuitem"
				>
					<span class="material-symbols-outlined" style="font-size:0.875rem">delete</span>
					{removing ? 'Deleting...' : 'Delete'}
				</button>
			</div>
		{/if}
	{/if}
</div>
