export function remember(key: string, value: string) {
	try {
		localStorage.setItem(key, value);
	} catch {
		return;
	}
}

export function recall<T extends string>(key: string, allowed: readonly T[]): T | null {
	try {
		const value = localStorage.getItem(key);
		return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
	} catch {
		return null;
	}
}
