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

export const ACTION_COLORS =
    [
        'rgb(255, 205, 86)',
        'rgb(255, 159, 64)',
        'rgb(255, 99, 132)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(255,102,102)'
    ];
