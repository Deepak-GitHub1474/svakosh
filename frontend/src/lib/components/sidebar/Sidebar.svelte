<script lang="ts">
	import { page } from '$app/state';
	import { uiState } from '$lib/store/ui.svelte';
	import { menuItems } from './const';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
</script>

<aside
	class="fixed left-0 top-10 h-[calc(100vh-2.5rem)] flex flex-col z-40 border-r border-border-subtle bg-background transition-all duration-300 ease-in-out
    {uiState.isWatchlistVisible ? 'w-16' : 'w-52'}"
>
	<nav class="flex-1 px-2 py-4 space-y-2.5">

		{#each menuItems as item}
			<a
				href={item.href}
				class="flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative
                {page.url.pathname === item.href 
                    ? 'text-primary bg-primary-subtle border-r border-primary' 
                    : 'text-gray-500 hover:text-primary hover:bg-white/[0.02]'}"
			>

				<span class="material-symbols-outlined icon-size {page.url.pathname === item.href ? 'fill-1' : ''}" style={page.url.pathname === item.href ? "font-variation-settings: 'FILL' 1;" : ""}>
					{item.icon}
				</span>
				{#if !uiState.isWatchlistVisible}
					<span class="text-sm whitespace-nowrap truncate animate-in fade-in slide-in-from-left-1 duration-200">
						{item.label}
					</span>
				{/if}
                
                {#if uiState.isWatchlistVisible}
                    <div class="absolute left-14 hidden group-hover:block whitespace-nowrap rounded-md font-medium bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] backdrop-blur-xl border-t border-l border-white/20 border-b border-r border-black/60 px-3 py-1.5 text-xs text-foreground z-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9),0_0_15px_rgba(255,255,255,0.05)]">
                        {item.label}
                        <div class="absolute right-full top-1/2 -translate-y-1/2 border-[7px] border-transparent border-r-white/10 z-[-1]"></div>
                    </div>
                {/if}
			</a>
		{/each}
	</nav>

	<div class="p-2 border-t border-border-subtle space-y-3">
		<div class="relative group">
			<SvaKoshButton 
				shine
				variant="secondary" 
				label={uiState.isWatchlistVisible ? '' : 'Watchlist'}
				onclick={() => uiState.toggleWatchlist()}
				class="w-full min-w-0 border-y-0 border-l-0 justify-start normal-case text-sm {uiState.isWatchlistVisible ? 'border-r-2 border-foreground/40 bg-white/5' : 'border-r-0 border-transparent'}"
			>
				{#snippet icon()}
					<span class="material-symbols-outlined icon-size
						{uiState.isWatchlistVisible ? 'opacity-100' : ''}"
					>
						preview
					</span>
				{/snippet}
			</SvaKoshButton>
			
			{#if uiState.isWatchlistVisible}
				<div class="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-md font-medium bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] backdrop-blur-xl border-t border-l border-white/20 border-b border-r border-black/60 px-3 py-1.5 text-xs text-foreground z-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9),0_0_15px_rgba(255,255,255,0.05)]">
					Watchlist
					<div class="absolute right-full top-1/2 -translate-y-1/2 border-[7px] border-transparent border-r-white/10 z-[-1]"></div>
				</div>
			{/if}
		</div>

		<div class="relative group">
			<SvaKoshButton 
				variant="bearish" 
				label={uiState.isWatchlistVisible ? '' : 'Logout'}
				class="w-full min-w-0 border-y-0 border-l-0 justify-start normal-case text-sm {uiState.isWatchlistVisible ? 'border-r-2 border-bearish/40 bg-bearish/5' : ''}"
			>
				{#snippet icon()}
					<span class="material-symbols-outlined icon-size
						{uiState.isWatchlistVisible ? 'opacity-100' : ''}"
					>
						logout
					</span>
				{/snippet}
			</SvaKoshButton>

			{#if uiState.isWatchlistVisible}
				<div class="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-md font-medium bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] backdrop-blur-xl border-t border-l border-white/20 border-b border-r border-black/60 px-3 py-1.5 text-xs text-foreground z-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9),0_0_15px_rgba(255,255,255,0.05)]">
					Logout
					<div class="absolute right-full top-1/2 -translate-y-1/2 border-[7px] border-transparent border-r-white/10 z-[-1]"></div>
				</div>
			{/if}
		</div>
	</div>
</aside>
