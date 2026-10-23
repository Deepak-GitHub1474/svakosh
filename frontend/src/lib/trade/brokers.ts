export type TBrokerField = { key: string; label: string; placeholder: string; secret?: boolean };

export type TBroker = {
	value: string;
	label: string;
	logo: string;
	api: string;
	partner: boolean;
	is_free: boolean;
	live: boolean;
	adminOnly?: boolean;
	fields: TBrokerField[];
	guide?: { portal: string; steps: string[] };
};

export const BROKERS: TBroker[] = [
	{
		value: 'angelone',
		label: 'Angel One',
		logo: 'ANGELONE',
		api: 'SmartAPI',
		partner: false,
		is_free: true,
		live: true,
		fields: [
			{ key: 'client_id', label: 'Client ID', placeholder: 'A123456' },
			{ key: 'api_key', label: 'API key', placeholder: 'Paste the API key of your SmartAPI app' }
		],
		guide: {
			portal: 'https://smartapi.angelone.in/new/apps',
			steps: [
				'Log in to SmartAPI with this Client ID and open My Apps.',
				'Add an app with the Redirect URL and Primary Static IP below.',
				'Save, then copy the app API key here.'
			]
		}
	},
	{
		value: 'paper',
		label: 'Paper',
		logo: 'PAPER',
		api: 'Simulator',
		partner: false,
		is_free: true,
		live: true,
		adminOnly: true,
		fields: [{ key: 'client_id', label: 'Paper account ID', placeholder: 'PAPER01' }]
	}
];

export const LIVE_BROKERS = BROKERS.filter((b) => b.live);

export const linkableBrokers = (isAdmin: boolean) =>
	LIVE_BROKERS.filter((b) => isAdmin || !b.adminOnly);

const byValue = new Map(BROKERS.map((b) => [b.value, b]));

export const brokerOf = (value: string) => byValue.get(value);
