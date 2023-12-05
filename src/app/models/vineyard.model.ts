import { Variety } from './variety.model';
import { Polygon } from 'ol/geom/Polygon';
import { Action } from './action.model';

export interface TimeSeriesEntry {
  date: moment.Moment;
  value: number;
}
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

export interface TimeSeriesStats {
  data: TimeSeriesEntry[];
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

export const getPermissionString = (permission: VineyardPermissions): string => {
  switch (permission) {
    case VineyardPermissions.VIEW:
      return 'View';
    case VineyardPermissions.EDIT:
      return 'Edit';
    case VineyardPermissions.OWNER:
      return 'Owner';
  }
  return '';
};

export interface VineyardBase {
  id?: string;
  name: string;
  address?: string;
  location: Polygon;
  actions: Action[];
  varieties: Variety[];
}

export interface Vineyard extends VineyardBase {
  shared: boolean;
  permissions: VineyardPermissions;
  owner: string;
  ownerName?: string;
}
