import { Variety } from './variety.model';
export interface Action {
    type: 'planting' | 'fertilizing' | 'harvest' | 'prune';
    date: string;
    description: string;
    varieties?: Variety[];
};