export interface StraddleDataPoint {
	ceOI: number;
	peOI: number;
	ceLTP: number;
	peLTP: number;
	ceATP: number;
	peATP: number;
	straddleRate: number;
	straddleATP: number;
	time: string;
}

export interface StraddleDataMap {
	[timestamp: string]: StraddleDataPoint;
}

export interface StraddleResponse {
	data: StraddleDataMap;
	strike: number;
}

export interface SelectionOption {
	label: string;
	value: string;
}
