import { Variety } from './variety.model';
import { Polygon } from 'ol/geom/Polygon';
import { Action } from './action.model';

export interface MeteoStatEntry {
  date: moment.Moment;
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

export interface VineyardBase {
  id?: string;
  name: string;
  address?: string;
  location: Polygon;
  actions: Action[];
  varieties: Variety[];
  meteo: MeteoStats;
}

export interface Vineyard extends VineyardBase {
  owner: boolean;
}
