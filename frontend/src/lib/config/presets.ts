export const presets = {
	production: {
		apiUrl: 'https://api.svakosh.com',
		wsUrl: 'wss://api.svakosh.com'
	},
	development: {
		apiUrl: 'http://127.0.0.1:8000',
		wsUrl: 'ws://127.0.0.1:8000'
	}
} as const;
