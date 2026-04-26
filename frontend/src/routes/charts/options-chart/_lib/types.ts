export interface OptionMetricData {
	ceOI: number;
	peOI: number;
	ceLTP: number;
	peLTP: number;
	ceVolume: number;
	peVolume: number;
	ceATP: number;
	peATP: number;
	ceChange: number;
	peChange: number;
	ceOpen: number;
	peOpen: number;
	ceHigh: number;
	peHigh: number;
	ceLow: number;
	peLow: number;
	ceClose: number;
	peClose: number;
	time: string;
}

export type OptionsChartDataMap = Record<string, OptionMetricData>;

export type MetricType = 'OI' | 'LTP' | 'Volume' | 'ATP' | 'LTP Change' | 'Open' | 'High' | 'Low' | 'Close';
