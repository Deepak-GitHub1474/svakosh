<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '' }: { class?: string } = $props();
</script>

<div class={cn('flex items-center gap-2.5 select-none', className)}>
	<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
		<defs>
			<linearGradient id="auric-hex" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="#f3d27a" />
				<stop offset="55%" stop-color="#d4af37" />
				<stop offset="100%" stop-color="#8a6f1f" />
			</linearGradient>
		</defs>
		<path
			d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
			fill="url(#auric-hex)"
			stroke="rgba(0,0,0,0.4)"
			stroke-width="0.5"
		/>
		<path
			d="M16 9 L22 12.5 L22 19.5 L16 23 L10 19.5 L10 12.5 Z"
			fill="rgba(8,9,10,0.55)"
		/>
		<path
			d="M13 14 L16 18.5 L19 14"
			fill="none"
			stroke="#f3d27a"
			stroke-width="1.4"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
	<div class="flex flex-col leading-none">
		<span class="text-[1.05rem] font-semibold tracking-[0.18em] text-foreground">AURIC</span>
		<span class="mt-0.5 text-[0.6rem] tracking-[0.12em] text-muted-foreground">
			Trade. Invest. Grow.
		</span>
	</div>
</div>
