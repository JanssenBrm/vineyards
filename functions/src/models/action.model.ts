
export interface Action {
    type: ActionType;
    date: string;
    description: string;
    bbch?: string;
    variety?: string[];
    id?: string;
    files: string[];
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
