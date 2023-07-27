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

export const ACTION_COLORS = [
  'rgb(255, 205, 86)',
  'rgb(255, 159, 64)',
  'rgb(255, 99, 132)',
  'rgb(75, 192, 192)',
  'rgb(54, 162, 235)',
  'rgb(153, 102, 255)',
  'rgb(255,102,102)',
  'rgb(201,102,255)',
];

export interface BaseAction {
  id?: string;
  type: ActionType;
  date: moment.Moment;
  description: string;
  variety?: string[];
  files?: string[];
}

export interface BaseActionDoc {
  id?: string;
  type: ActionType;
  date: string;
  description: string;
  variety?: string[];
  files?: string[];
}

export interface Action extends BaseAction {
  html: string;
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
