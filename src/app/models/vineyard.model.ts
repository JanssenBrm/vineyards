import { Variety } from './variety.model';
import { Polygon } from 'ol/geom/Polygon';
import { Action } from './action.model';

export interface Vineyard {
    id: string;
    name: string;
    address: string;
    location: Polygon;
    actions: Action[];
    varieties: Variety[];
}
