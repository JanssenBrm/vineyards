export enum WarningType {
  FROST = 'FROST',
}
export interface Warning {
  date: moment.Moment;
  type: WarningType;
  description: string;
}
