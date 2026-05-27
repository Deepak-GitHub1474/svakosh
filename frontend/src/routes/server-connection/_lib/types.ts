export type THealthData = {
	service: string;
	version: string;
	env: 'development' | 'production';
};

export type THealthResponse = {
	backendUrl: string;
	success: boolean;
	message: string;
	data: THealthData;
};
