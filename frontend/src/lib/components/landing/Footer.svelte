<script lang="ts">
	import { BRAND } from '$lib/brand';
	import { FOOTER } from './data';
</script>

<footer class="border-border-subtle mt-20 border-t md:mt-28">
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
		<div class="grid grid-cols-2 gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
			<div class="col-span-2 md:col-span-1">
				<span class="text-2xl font-semibold tracking-tight sm:text-3xl">
					Sva<span class="text-primary">Kosh</span>
				</span>
				<p class="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
					{BRAND.tagline}
				</p>
			</div>

			{#each FOOTER as column (column.title)}
				<div>
					<h2 class="text-sm font-medium">{column.title}</h2>
					<ul class="text-muted-foreground mt-4 space-y-3 text-sm">
						{#each column.links as link (link.href)}
							<li>
								<a href={link.href} class="hover:text-foreground transition-colors">{link.label}</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<div
			class="border-border-subtle text-muted-foreground mt-10 flex flex-col gap-4 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between"
		>
			<p>© {new Date().getFullYear()} SvaKosh</p>
			<p>Market data shown for illustration. Not investment advice.</p>
		</div>
	</div>
</footer>
