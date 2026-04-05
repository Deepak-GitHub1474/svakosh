import type { BackendConfig } from './lib/config';

declare module '*.svg' {
	const content: string;
	export default content;
}

declare global {
	namespace App {
		interface PageData {
			backend: BackendConfig;
		}
	}
}

export {};
