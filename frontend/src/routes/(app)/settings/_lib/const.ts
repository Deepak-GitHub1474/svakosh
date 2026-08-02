import Palette from '$lib/components/svg-provider/material/Palette.svelte';
import PasskeyIcon from '$lib/components/svg-provider/material/PasskeyIcon.svelte';
import type { PasskeyColumn, SettingsTab } from './types';

export const SETTINGS_TABS: SettingsTab[] = [
	{
		id: 'passkeys',
		label: 'Passkeys',
		icon: PasskeyIcon,
		subtitle: 'Sign in faster and more securely with your fingerprint, face, or device PIN.'
	},
	{
		id: 'themes',
		label: 'Themes',
		icon: Palette,
		subtitle: 'Personalize how SvaKosh looks.'
	}
];

export const PASSKEY_COLUMNS: PasskeyColumn[] = [
	{ label: 'Device', class: 'pr-4 text-left' },
	{ label: 'Added On', class: 'pr-4 text-left' },
	{ label: 'Last Used', class: 'pr-4 text-left' },
	{ label: 'Actions', class: 'text-right' }
];
