export interface TMaxPainPoint {
    strike: number;
    value: number;
    callPayout: number;
    putPayout: number;
    totalPayout: number;
}

export interface TMaxPainData {
    [strike: number]: TMaxPainPoint;
}
