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
	autoLogin?: boolean;
	convert?: boolean;
	fields: TBrokerField[];
	guide?: { portal: string; portalLabel: string; redirect: boolean; steps: string[] };
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
			portalLabel: 'Open SmartAPI apps',
			redirect: true,
			steps: [
				'Log in to SmartAPI with this Client ID and open My Apps.',
				'Add an app with the Redirect URL and Primary Static IP below.',
				'Save, then copy the app API key here.'
			]
		}
	},
	{
		value: 'zerodha',
		label: 'Zerodha',
		logo: 'ZERODHA',
		api: 'Kite Connect',
		partner: false,
		is_free: true,
		live: true,
		fields: [
			{ key: 'client_id', label: 'Client ID', placeholder: 'AB1234' },
			{
				key: 'api_key',
				label: 'API key',
				placeholder: 'Paste the API key of your Kite Connect app'
			},
			{
				key: 'api_secret',
				label: 'API secret',
				placeholder: 'Paste the API secret of your Kite Connect app',
				secret: true
			}
		],
		guide: {
			portal: 'https://developers.kite.trade/apps',
			portalLabel: 'Open Kite Connect apps',
			redirect: true,
			steps: [
				'Log in to Kite Connect and create a Personal app with this Client ID.',
				'Set the Redirect URL below, and add the Primary Static IP in your Kite Connect profile.',
				'Copy the app API key and API secret here.'
			]
		}
	},
	{
		value: 'groww',
		label: 'Groww',
		logo: 'GROWW',
		api: 'Groww Trade API',
		partner: false,
		is_free: true,
		live: true,
		autoLogin: true,
		convert: false,
		fields: [
			{ key: 'client_id', label: 'Client ID', placeholder: 'Your Groww client ID (UCC)' },
			{ key: 'api_key', label: 'API key', placeholder: 'Paste your Groww API key' },
			{
				key: 'api_secret',
				label: 'API secret',
				placeholder: 'Paste your Groww API secret',
				secret: true
			}
		],
		guide: {
			portal: 'https://groww.in/trade-api/api-keys',
			portalLabel: 'Open Groww API keys',
			redirect: false,
			steps: [
				'Log in to Groww with this client ID and open Trade API keys.',
				'Generate an API key with secret, and add the Primary Static IP below if Groww asks for it.',
				'Copy the API key and secret here. Approve the key on Groww each trading day before logging in.'
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
		autoLogin: true,
		fields: [{ key: 'client_id', label: 'Paper account ID', placeholder: 'PAPER01' }]
	}
];

export const LIVE_BROKERS = BROKERS.filter((b) => b.live);

export const linkableBrokers = (isAdmin: boolean) =>
	LIVE_BROKERS.filter((b) => isAdmin || !b.adminOnly);

const byValue = new Map(BROKERS.map((b) => [b.value, b]));

export const brokerOf = (value: string) => byValue.get(value);
