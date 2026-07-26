export type Passkey = {
	credential_id: string;
	device_name: string | null;
	created_at: string | null;
	last_used_at: string | null;
};

export type SettingsTab = {
	id: 'passkeys' | 'themes';
	label: string;
	icon: string;
	subtitle: string;
};

export type PasskeyResult = { ok: boolean; message?: string };

export type PasskeyColumn = { label: string; class: string };
