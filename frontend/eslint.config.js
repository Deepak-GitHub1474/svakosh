import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const tsOnly = ts.configs.recommended.map((config) => ({
	...config,
	files: config.files ?? ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
	ignores: ['**/*.svelte', ...(config.ignores ?? [])]
}));

export default [
	includeIgnoreFile(gitignorePath),
	...eslintPluginSvelte.configs.recommended,
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				projectService: true,
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
		...js.configs.recommended,
		ignores: ['**/*.svelte']
	},
	...tsOnly,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	}
];
