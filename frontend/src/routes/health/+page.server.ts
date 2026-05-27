import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		ok: true as const,
		lastPulseAt: new Date().toISOString()
	};
};
