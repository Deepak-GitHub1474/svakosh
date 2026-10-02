<script lang="ts">
	import SvaKoshNumberInput from '$lib/components/svakosh/SvaKoshNumberInput.svelte';
	import { MAX_STRIKE_RANGE, MIN_STRIKE_RANGE, STRIKE_RANGE_DEBOUNCE } from '../_lib/const';
	import { chain, setRange } from '../_lib/state.svelte';

	let draftRange = $state(chain.range);
	let typing = $state(false);

	// Steppers apply at once; typed values wait for a pause so "12" is not applied as "1".
	$effect(() => {
		const next = draftRange;
		if (next === chain.range) return;
		if (!typing) {
			setRange(next);
			return;
		}
		const timer = setTimeout(() => setRange(next), STRIKE_RANGE_DEBOUNCE);
		return () => clearTimeout(timer);
	});

	function onFocusIn(event: FocusEvent) {
		typing = event.target instanceof HTMLInputElement;
	}

	function onFocusOut(event: FocusEvent) {
		if (!(event.target instanceof HTMLInputElement)) return;
		typing = false;
		setRange(draftRange);
		draftRange = chain.range;
	}
</script>

<div class="w-full md:w-36" onfocusin={onFocusIn} onfocusout={onFocusOut}>
	<SvaKoshNumberInput
		bind:value={draftRange}
		min={typing ? 0 : MIN_STRIKE_RANGE}
		max={MAX_STRIKE_RANGE}
		label="Strikes"
	/>
</div>
