export type TResult<T = unknown> =
	| { ok: true; data: T }
	| { ok: false; error: string; status?: number };

export async function apiCall<T = unknown>(
	url: string,
	method: string,
	body?: unknown
): Promise<TResult<T>> {
	try {
		const res = await fetch(url, {
			method,
			headers: { 'content-type': 'application/json' },
			body: body === undefined ? undefined : JSON.stringify(body)
		});
		const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
		if (!res.ok || !json?.success) {
			const detail = json?.data as Record<string, unknown> | null | undefined;
			return {
				ok: false,
				error:
					(detail?.message as string | undefined) ??
					(json?.message as string | undefined) ??
					'Request failed.',
				status: res.status
			};
		}
		return { ok: true, data: json.data as T };
	} catch {
		return { ok: false, error: 'Network error. Try again.' };
	}
}

export type TStandardApiResponse<T = unknown> = {
	success: boolean;
	message: string;
	data: T;
};

export function resolveApiResponse<T = unknown>(
	response: Response,
	result: TStandardApiResponse<T>
): TStandardApiResponse<T> {
	if (!response.ok) {
		return { success: false, message: 'Request failed', data: null as T };
	}
	return {
		success: result?.success,
		message: result?.message,
		data: result?.data
	};
}
