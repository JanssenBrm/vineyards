export interface WeatherInfo {
    date: string;
    label: string;
    icon: string;
    temp: {
        min: number;
        max: number;
    };
}
