export interface StrangleDataPoint {
	time: string;
	ceOI: number;
	peOI: number;
	strangleRate: number;
	strangleATP: number;
}

export interface StrangleDataMap {
	[time: string]: StrangleDataPoint;
}
