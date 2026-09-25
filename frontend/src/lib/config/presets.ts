export const presets = {
	production: {
		apiUrl: 'https://svakosh-svakoshapi-ow8okw-b5028b-35-188-103-96.sslip.io',
		wsUrl: 'wss://svakosh-svakoshapi-ow8okw-b5028b-35-188-103-96.sslip.io'
	},
	development: {
		apiUrl: 'http://127.0.0.1:8000',
		wsUrl: 'ws://127.0.0.1:8000'
	}
} as const;
