<script lang="ts">
	import { untrack, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import type { Props } from './_lib/types';
	import { GENDER_OPTIONS, INDIAN_STATES } from './_lib/const';
	import SvaKoshCard from '$lib/components/svakosh/SvaKoshCard.svelte';
	import SvaKoshInput from '$lib/components/svakosh/SvaKoshInput.svelte';
	import SvaKoshLabel from '$lib/components/svakosh/SvaKoshLabel.svelte';
	import SvaKoshSelector from '$lib/components/svakosh/SvaKoshSelector.svelte';
	import SvaKoshButton from '$lib/components/svakosh/SvaKoshButton.svelte';
	import ProfileCover from './_components/ProfileCover.svelte';
	import WhatsappField from './_components/WhatsappField.svelte';

	let { data }: Props = $props();

	const profile = $derived(data.profile);
	const details = $derived(profile?.profile ?? null);
	const address = $derived(details?.address ?? null);
	const status = $derived(profile?.status ?? 'pending');

	const stateOptions = INDIAN_STATES.map((s) => ({ label: s, value: s }));

	let fullName = $state(untrack(() => data.profile?.profile?.full_name ?? ''));
	let gender = $state(untrack(() => data.profile?.profile?.gender ?? ''));
	let genderOpen = $state(false);
	let dob = $state(untrack(() => data.profile?.profile?.dob ?? ''));
	let occupation = $state(untrack(() => data.profile?.profile?.occupation ?? ''));
	let pan = $state('');
	let city = $state(untrack(() => data.profile?.profile?.address?.city ?? ''));
	let stateValue = $state(untrack(() => data.profile?.profile?.address?.state ?? ''));
	let stateOpen = $state(false);
	let pincode = $state(untrack(() => data.profile?.profile?.address?.pincode ?? ''));
	let saving = $state(false);
	let savedFrom = $state('');
	let flash = $state<{ section: string; ok: boolean; text: string } | null>(null);
	let flashId: ReturnType<typeof setTimeout> | undefined;

	function showFlash(section: string, ok: boolean, text: string) {
		flash = { section, ok, text };
		clearTimeout(flashId);
		flashId = setTimeout(() => {
			flash = null;
		}, 3000);
	}

	onDestroy(() => clearTimeout(flashId));

	const personalChanged = $derived(
		fullName !== (details?.full_name ?? '') ||
			gender !== (details?.gender ?? '') ||
			dob !== (details?.dob ?? '') ||
			occupation !== (details?.occupation ?? '') ||
			pan !== ''
	);
	const addressChanged = $derived(
		city !== (address?.city ?? '') ||
			stateValue !== (address?.state ?? '') ||
			pincode !== (address?.pincode ?? '')
	);
</script>

<svelte:head>
	<title>Profile | SvaKosh</title>
</svelte:head>

<ProfileCover {details} {status} />

<form
	method="POST"
	action="?/update"
	class="mt-6 flex flex-col gap-6 pb-8"
	use:enhance={() => {
		saving = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			if (result.type === 'success') {
				pan = '';
				showFlash(savedFrom, true, 'Profile updated.');
			} else if (result.type === 'failure') {
				showFlash(
					savedFrom,
					false,
					(result.data as { message?: string } | undefined)?.message ?? 'Update failed.'
				);
			}
			saving = false;
		};
	}}
>
	{#snippet saveRow(section: string, changed: boolean)}
		<div class="mt-6 flex items-center gap-4">
			<SvaKoshButton
				variant="solid"
				type="submit"
				label={saving && savedFrom === section ? 'Saving...' : 'Save Changes'}
				disabled={saving || !changed}
				onclick={() => {
					savedFrom = section;
				}}
			/>
			{#if flash && flash.section === section}
				<span
					transition:fade={{ duration: 200 }}
					class="text-sm {flash.ok ? 'text-bullish' : 'text-bearish'}"
				>
					{flash.text}
				</span>
			{/if}
		</div>
	{/snippet}

	<SvaKoshCard class="relative overflow-visible p-5 sm:p-6 {genderOpen ? 'z-40' : ''}">
		<h2 class="text-muted-foreground mb-5 flex items-center gap-2 text-sm tracking-wider uppercase">
			<span class="bg-primary h-4 w-1 rounded-full"></span>
			Personal Details
		</h2>
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			<div>
				<SvaKoshLabel for="email">Email</SvaKoshLabel>
				<SvaKoshInput id="email" value={profile?.email ?? ''} disabled />
			</div>
			<div>
				<SvaKoshLabel for="mobile">Mobile Number</SvaKoshLabel>
				<SvaKoshInput id="mobile" value={profile?.mobile_number ?? ''} disabled />
			</div>
			<div>
				<SvaKoshLabel for="full_name">Full Name</SvaKoshLabel>
				<SvaKoshInput
					id="full_name"
					name="full_name"
					bind:value={fullName}
					placeholder="Your full name"
				/>
			</div>
			<div>
				<SvaKoshLabel for="gender">Gender</SvaKoshLabel>
				<SvaKoshSelector
					id="gender"
					options={GENDER_OPTIONS}
					bind:value={gender}
					bind:isOpen={genderOpen}
					placeholder="Select gender"
					onSelect={(v) => (gender = v)}
				/>
				<input type="hidden" name="gender" value={gender} />
			</div>
			<div>
				<SvaKoshLabel for="dob">Date of Birth</SvaKoshLabel>
				<SvaKoshInput id="dob" name="dob" type="date" bind:value={dob} />
			</div>
			<div>
				<SvaKoshLabel for="occupation">Occupation</SvaKoshLabel>
				<SvaKoshInput
					id="occupation"
					name="occupation"
					bind:value={occupation}
					placeholder="e.g. trader"
				/>
			</div>
			<div>
				<SvaKoshLabel for="pan_number">PAN</SvaKoshLabel>
				<SvaKoshInput
					id="pan_number"
					name="pan_number"
					bind:value={pan}
					placeholder="ABCDE1234F"
					maxlength={10}
					class="uppercase"
				/>
				{#if details?.pan_number}
					<p class="text-muted-foreground mt-1 ml-1 text-[0.7rem]">Current: {details.pan_number}</p>
				{/if}
			</div>
			<div>
				<WhatsappField initial={details?.whatsapp_number ?? ''} />
			</div>
		</div>
		{@render saveRow('personal', personalChanged)}
	</SvaKoshCard>

	<SvaKoshCard class="overflow-visible p-5 sm:p-6">
		<h2 class="text-muted-foreground mb-5 flex items-center gap-2 text-sm tracking-wider uppercase">
			<span class="bg-primary h-4 w-1 rounded-full"></span>
			Address
		</h2>
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
			<div>
				<SvaKoshLabel for="city">City</SvaKoshLabel>
				<SvaKoshInput id="city" name="city" bind:value={city} placeholder="City" />
			</div>
			<div>
				<SvaKoshLabel for="state">State</SvaKoshLabel>
				<SvaKoshSelector
					id="state"
					options={stateOptions}
					bind:value={stateValue}
					bind:isOpen={stateOpen}
					searchable={true}
					placeholder="Select state"
					onSelect={(v) => (stateValue = v)}
				/>
				<input type="hidden" name="state" value={stateValue} />
			</div>
			<div>
				<SvaKoshLabel for="pincode">Pincode</SvaKoshLabel>
				<SvaKoshInput
					id="pincode"
					name="pincode"
					bind:value={pincode}
					placeholder="400001"
					maxlength={6}
				/>
			</div>
		</div>
		{@render saveRow('address', addressChanged)}
	</SvaKoshCard>
</form>
