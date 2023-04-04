import { Variety } from './variety.model';
import { Action } from './action.model';
import { Polygon } from 'ol/geom';
export interface MeteoStatEntry {
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

export interface MeteoStats {
  data: MeteoStatEntry[];
}
export interface Vineyard {
  id?: string;
  name: string;
  address?: string;
  location: Polygon;
  actions: Action[];
  varieties: Variety[];
  meteo: MeteoStats;
}
