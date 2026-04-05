import { presets } from './presets';

export type BackendConfig = {
	apiUrl: string;
	wsUrl: string;
	isDev: boolean;
	isProd: boolean;
};

type EnvSlice = {
	SVAKOSH_API_URL?: string;
	SVAKOSH_WS_URL?: string;
};

export function resolveBackendConfig(env: EnvSlice, isProd: boolean): BackendConfig {
	const preset = isProd ? presets.production : presets.development;
	return {
		apiUrl: env.SVAKOSH_API_URL ?? preset.apiUrl,
		wsUrl: env.SVAKOSH_WS_URL ?? preset.wsUrl,
		isDev: !isProd,
		isProd
	};
}
