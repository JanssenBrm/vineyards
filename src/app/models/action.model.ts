import { Variety } from './variety.model';
export interface Action {
    id?: string;
    type: ActionType;
    date: string;
    description: string;
    bbch?: string;
    variety?: string[];
    value?: number;
    files?: string[];
}


export enum ActionType {
    Planting = 'planting',
    Fertilizing = 'fertilizing',
    Observation = 'observation',
    BBCH = 'bbch',
    Damage = 'damage',
    Prune = 'prune',
    Harvest = 'harvest',
    Brix = 'brix'
}
