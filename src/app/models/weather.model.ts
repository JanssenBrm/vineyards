export interface WeatherInfo {
  date: moment.Moment;
  label: string;
  icon: string;
  temp: {
    min: number;
    max: number;
  };
}

export interface WeatherStationInfo {
  date: moment.Moment;
  heat: number;
  humidity: number;
  sunhours: number;
  temperature: number;
}
