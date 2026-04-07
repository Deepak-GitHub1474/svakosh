import type { LayoutServerLoad } from './$types';
import { resolveBackendConfig } from '$lib/config';

export const load: LayoutServerLoad = async () => {
	return {
		backend: resolveBackendConfig()
	};
};
