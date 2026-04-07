export type TStandardApiResponse = {
	success: boolean;
	message: string;
	data: any;
};

export function resolveApiResponse(response: Response, result: TStandardApiResponse): TStandardApiResponse {
	try {
		if (!response.ok) {
			throw new Error('Request failed');
		} else {
			return {
				success: result?.success,
				message: result?.message,
				data: result?.data
			};
		}
	} catch (error: any) {
		return {
			success: false,
			message: error.message,
			data: null
		};
	}
}
