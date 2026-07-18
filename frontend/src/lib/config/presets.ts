export const presets = {
	production: {
		apiUrl: 'http://svakosh-backend-liz5ku-07fddf-34-74-52-79.traefik.me',
		wsUrl: 'ws://svakosh-backend-liz5ku-07fddf-34-74-52-79.traefik.me'
	},
	development: {
		apiUrl: 'http://127.0.0.1:9000',
		wsUrl: 'ws://127.0.0.1:9000'
	}
} as const;
