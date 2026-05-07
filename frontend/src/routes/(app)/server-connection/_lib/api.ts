import { resolveApiResponse } from '$lib/api';
import { resolveBackendConfig } from '$lib/config';
import type { THealthResponse } from './types';

export async function getServerConnectionView(): Promise<THealthResponse> {
	const backendUrl = resolveBackendConfig().apiUrl;
	const api = `${backendUrl}/health`;
	const apiResponse = await fetch(api, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});
	const responseResult = await apiResponse.json();
	const result = resolveApiResponse(apiResponse, responseResult);
	return { backendUrl, ...result };
}