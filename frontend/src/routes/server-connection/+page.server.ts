import { resolveBackendConfig } from '$lib/config';
import { resolveApiResponse } from '$lib/api';
import type { PageServerLoad } from './$types';
import type { THealthResponse } from './_lib/types';

export const load: PageServerLoad = async ({ fetch }) => {
	const backendUrl = resolveBackendConfig().apiUrl;
	try {
		const apiResponse = await fetch(`${backendUrl}/health`, {
			method: 'GET',
			headers: { Accept: 'application/json' }
		});
		const responseResult = await apiResponse.json();
		const result = resolveApiResponse(apiResponse, responseResult);
		const healthInfo: THealthResponse = { backendUrl, ...result };
		return { healthInfo, requestError: null as string | null };
	} catch (e) {
		const requestError = e instanceof Error ? e.message : String(e);
		return { healthInfo: null as THealthResponse | null, requestError, backendUrl };
	}
};
