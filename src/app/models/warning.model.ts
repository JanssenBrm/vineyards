export enum WarningType {
  FROST = 'FROST',
}
export interface Warning {
  date: string;
  type: WarningType;
  description: string;
}
