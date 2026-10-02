export const presets = {
	production: {
		apiUrl: 'https://svakosh-svakoshapi-vjmujw-551535-35-244-31-217.sslip.io',
		wsUrl: 'wss://svakosh-svakoshapi-vjmujw-551535-35-244-31-217.sslip.io'
	},
	development: {
		apiUrl: 'http://127.0.0.1:8000',
		wsUrl: 'ws://127.0.0.1:8000'
	}
} as const;
