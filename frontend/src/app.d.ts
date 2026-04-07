import type { TBackendConfig } from './lib/config';

declare module '*.svg' {
	const content: string;
	export default content;
}

declare global {
	namespace App {
		interface PageData {
			backend: TBackendConfig;
		}
	}
}

export {};
