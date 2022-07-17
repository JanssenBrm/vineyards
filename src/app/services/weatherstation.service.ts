import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Integration } from '../models/integration.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WeatherStationService {
  constructor(private http: HttpClient) {}

  public readWeatherData(integration: Integration): Observable<any> {
    return this.http.get(`${integration.url}?apiKey=${integration.key}`);
  }
}
