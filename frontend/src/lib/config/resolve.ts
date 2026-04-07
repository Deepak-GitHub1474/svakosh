import { env } from '$env/dynamic/public';
import { presets } from './presets';

export type TBackendConfig = {
	apiUrl: string;
	wsUrl: string;
	isProd: boolean;
};

export function resolveBackendConfig(): TBackendConfig {
	const appEnv = (env.PUBLIC_SAVKOSH_APP_ENV || 'development').toLowerCase();
	const isProd = appEnv === 'production';
	const preset = isProd ? presets.production : presets.development;
	return {
		apiUrl: preset.apiUrl,
		wsUrl: preset.wsUrl,
		isProd
	};
}
