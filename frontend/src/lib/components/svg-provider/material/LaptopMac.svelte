<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		class: className = '',
		style = '',
		filled = false
	}: { class?: string; style?: string; filled?: boolean } = $props();
</script>

<svg
	class={cn('inline-block shrink-0 align-[-0.15em]', className)}
	{style}
	width="1em"
	height="1em"
	viewBox="0 -960 960 960"
	fill="currentColor"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<path d="M57-160q-23.51 0-40.26-17.63Q0-195.25 0-220h141q-24 0-42-18t-18-42v-500q0-24 18-42t42-18h678q24 0 42 18t18 42v500q0 24-18 42t-42 18h141q0 25-17.62 42.5Q924.75-160 900-160H57Zm447-32q10-10 10-24t-10-24q-10-10-24-10t-24 10q-10 10-10 24t10 24q10 10 24 10t24-10Zm-363-88h678v-500H141v500Zm0 0v-500 500Z" />
</svg>
