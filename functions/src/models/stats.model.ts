export interface MeteoStats {
    data: MeteoStat[];
}

export interface MeteoStat {
    date: string;
    tavg: number;
    tmin: number;
    tmax: number;
    prcp: number;
    snow: number;
    wdir: number;
    wspd: number;
    wpgt: number;
    pres: number;
    tsun: number;
}
