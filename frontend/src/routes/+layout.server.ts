import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';
import { resolveBackendConfig } from '$lib/config';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async () => {
	return {
		backend: resolveBackendConfig(
			{
				SVAKOSH_API_URL: env.SVAKOSH_API_URL,
				SVAKOSH_WS_URL: env.SVAKOSH_WS_URL
			},
			!dev
		)
	};
};
