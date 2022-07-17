export interface WeatherInfo {
  date: string;
  label: string;
  icon: string;
  temp: {
    min: number;
    max: number;
  };
}

export interface WeatherStationInfo {
  date: string;
  heat: number;
  humidity: number;
  light: number;
  temperature: number;
}
