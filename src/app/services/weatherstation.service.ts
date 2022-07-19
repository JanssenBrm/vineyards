import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Integration } from '../models/integration.model';
import { HttpClient } from '@angular/common/http';
import { WeatherStationInfo } from '../models/weather.model';

@Injectable({
  providedIn: 'root',
})
export class WeatherStationService {
  constructor(private http: HttpClient) {}

  public readWeatherData(integration: Integration): Observable<WeatherStationInfo[]> {
    return this.http.get<WeatherStationInfo[]>(`${integration.url}/daily?apiKey=${integration.key}`);
  }
}
