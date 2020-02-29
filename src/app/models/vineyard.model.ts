import { Polygon } from 'ol/geom/Polygon';
import {Season} from './season.model';

export interface Vineyard {
    id: string;
    name: string;
    address: string;
    location: Polygon;
    seasons: Season[];
}
