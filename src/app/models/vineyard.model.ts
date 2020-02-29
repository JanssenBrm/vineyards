import { Polygon } from 'ol/geom/Polygon';

export interface Vineyard {
    id: string;
    name: string;
    address: string;
    location: Polygon;
}
