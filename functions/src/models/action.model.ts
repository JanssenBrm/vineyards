export enum ActionType {
  Planting = 'planting',
  Fertilizing = 'fertilizing',
  Observation = 'observation',
  BBCH = 'bbch',
  Damage = 'damage',
  Prune = 'prune',
  Harvest = 'harvest',
  Brix = 'brix',
}

export interface Action {
  id: string;
  type: ActionType;
  date: string;
  description: string;
  variety?: string[];
  files?: string[];
}

export interface PlantingAction extends Action {
  rows: number;
  plantsPerRow: number;
}

export interface BBCHAction extends Action {
  bbch?: string;
}

export interface BrixAction extends Action {
  value?: number;
}
