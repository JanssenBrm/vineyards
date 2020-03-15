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
    Harvest = 'harvest',
    Prune = 'prune',
    Observation = 'observation',
    BBCH = 'bbch',
    Damage = 'damage'
}