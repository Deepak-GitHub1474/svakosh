export const presets = {
	production: {
		apiUrl: 'http://svakosh-svakoshapi-zadmrr-efc705-13-53-86-234.sslip.io',
		wsUrl: 'ws://svakosh-svakoshapi-zadmrr-efc705-13-53-86-234.sslip.io'
	},
	development: {
		apiUrl: 'http://127.0.0.1:8000',
		wsUrl: 'ws://127.0.0.1:8000'
	}
} as const;
