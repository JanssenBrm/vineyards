import { Variety } from './variety.model';
import { Action } from './action.model';
import {MeteoStats} from './stats.model';

export interface Vineyard {
    id: string;
    name: string;
    address: string;
    location: any;
    actions: Action[];
    varieties: Variety[];
    meteo: MeteoStats;
}
