export enum IntegrationType {
  WEATHER_STATION = 'weatherstation',
}

export interface Integration {
  id?: string;
  type: IntegrationType;
  key: string;
  url: string;
  vineyards: string[];
}
