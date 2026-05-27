export interface OIDataPoint {
	ceOI: number;
	peOI: number;
}

export interface OIDataMap {
	[timestamp: string]: OIDataPoint;
}

export interface StrikeData {
	strike: string;
	data: OIDataMap;
}

export interface MultiOIDataMap {
	[timestamp: string]: {
		ceOI: number;
		peOI: number;
	};
}

export interface SelectionOption {
	label: string;
	value: string;
}
