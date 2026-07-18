<script lang="ts">
	import cover from '../_assets/profilecover.png';
	import verifiedBadge from '../_assets/verifiedbadge.png';
	import SvaKoshBadge from '$lib/components/svakosh/SvaKoshBadge.svelte';
	import { statusVariant } from '../_lib/helper';
	import type { TProfileDetails } from '../_lib/types';

	let { details, status }: { details: TProfileDetails | null; status: string } = $props();

	const displayName = $derived(details?.full_name?.trim() || details?.username?.trim() || 'Unknown');
	const avatarUrl = $derived(details?.avatar?.trim() || '');
	const initials = $derived(
		displayName
			.split(' ')
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);
</script>

<section class="sticky top-0 z-20 -mt-10 -mr-4 overflow-hidden">
	<img
		src={cover}
		alt="Profile cover"
		class="block h-52 w-full object-cover object-[center_32%] sm:h-64 lg:h-80"
	/>
	<div
		class="absolute inset-0 bg-gradient-to-r from-[#08090a]/95 via-[#08090a]/55 to-transparent"
	></div>
	<div class="absolute inset-0 bg-gradient-to-t from-[#08090a] via-[#08090a]/25 to-transparent"></div>

	<div class="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 pl-2 sm:gap-5 sm:p-6 sm:pl-3">
		<div
			class="border-primary/10 shrink-0 rounded-full border bg-[#08090a] p-[5px]"
			style="box-shadow: 0 10px 24px rgba(0,0,0,0.45);"
		>
			<div
				class="border-primary relative h-20 w-20 overflow-hidden rounded-full border sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
			>
				{#if avatarUrl}
					<img src={avatarUrl} alt={displayName} class="h-full w-full object-cover" />
				{:else}
					<div
						class="bg-primary/15 text-primary flex h-full w-full items-center justify-center text-3xl"
					>
						{initials}
					</div>
				{/if}
				<div
					class="pointer-events-none absolute inset-0 rounded-full"
					style="background: radial-gradient(55% 38% at 50% 0%, rgba(212,175,55,0.16), transparent 72%);"
				></div>
			</div>
		</div>

		<div class="min-w-0">
			<h1
				class="text-foreground truncate text-xl leading-none tracking-tight sm:text-2xl lg:text-3xl"
			>
				{displayName}
			</h1>
			{#if details?.occupation || details?.address?.city}
				<div
					class="text-muted-foreground/80 mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs capitalize"
				>
					{#if details?.occupation}
						<span class="flex items-center gap-1.5">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-3.5 w-3.5 shrink-0"
							>
								<rect x="2" y="7" width="20" height="14" rx="2" />
								<path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
							</svg>
							{details.occupation}
						</span>
					{/if}
					{#if details?.address?.city}
						<span class="flex items-center gap-1.5">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="h-3.5 w-3.5 shrink-0"
							>
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
							{details.address.city}
						</span>
					{/if}
				</div>
			{/if}
			<div class="mt-4">
				<SvaKoshBadge
					variant={statusVariant(status)}
					class="gap-1 rounded-full px-2.5 py-1 text-xs sm:text-sm"
				>
					{status}
					<img src={verifiedBadge} alt="Verified" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
				</SvaKoshBadge>
			</div>
		</div>
	</div>
</section>
