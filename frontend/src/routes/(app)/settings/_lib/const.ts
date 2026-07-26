import type { PasskeyColumn, SettingsTab } from './types';

export const SETTINGS_TABS: SettingsTab[] = [
	{
		id: 'passkeys',
		label: 'Passkeys',
		icon: 'passkey',
		subtitle: 'Sign in faster and more securely with your fingerprint, face, or device PIN.'
	},
	{
		id: 'themes',
		label: 'Themes',
		icon: 'palette',
		subtitle: 'Personalize how SvaKosh looks.'
	}
];

export const PASSKEY_COLUMNS: PasskeyColumn[] = [
	{ label: 'Device', class: 'pr-4 text-left' },
	{ label: 'Added On', class: 'pr-4 text-left' },
	{ label: 'Last Used', class: 'pr-4 text-left' },
	{ label: 'Actions', class: 'text-right' }
];
