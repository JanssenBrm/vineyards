import { Variety } from './variety.model';
export interface Action {
    type: ActionType;
    date: string;
    description: string;
    pictures?: string[];
    varieties?: Variety[];
}


export enum ActionType {
    Planting = 'planting',
    Fertilizing = 'fertilizing',
    Observation = 'observation',
    BBCH = 'bbch',
    Damage = 'damage',
    Prune = 'prune',
    Harvest = 'harvest',
}
