import {VintageColor} from './vintagecolor.model';

export interface Vintage {
    id: string;
    year: number;
    name: string;
    color: VintageColor;
    varieties: string[];
    cover?: string;
}
