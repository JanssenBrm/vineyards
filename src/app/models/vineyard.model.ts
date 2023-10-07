import { Variety } from './variety.model';
import { Action } from './action.model';
import { Polygon } from 'geojson';

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

export enum VineyardPermissions {
  NONE,
  VIEW,
  EDIT,
  OWNER,
}

export interface VineyardBase {
  id?: string;
  name: string;
  address?: string;
  location: Polygon | string;
  actions: Action[];
  varieties: Variety[];
}

export interface Vineyard extends VineyardBase {
  location: Polygon;
  shared: boolean;
  permissions: VineyardPermissions;
  owner: string;
  ownerName?: string;
}
