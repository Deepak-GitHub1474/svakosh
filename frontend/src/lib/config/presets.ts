export const presets = {
	production: {
		apiUrl: 'https://svakosh-svakoshapi-zadmrr-efc705-13-53-86-234.sslip.io',
		wsUrl: 'wss://svakosh-svakoshapi-zadmrr-efc705-13-53-86-234.sslip.io'
	},
	development: {
		apiUrl: 'http://127.0.0.1:8000',
		wsUrl: 'ws://127.0.0.1:8000'
	}
} as const;
