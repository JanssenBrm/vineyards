import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Integration } from '../models/integration.model';
import { HttpClient } from '@angular/common/http';
import { WeatherStationInfo } from '../models/weather.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WeatherStationService {
  private dataCache: { key: string; data: WeatherStationInfo[] }[] = [];

  constructor(private http: HttpClient) {}

  public readWeatherData(integration: Integration, daily: boolean): Observable<WeatherStationInfo[]> {
    const key = `${integration.key}_${daily}`;
    const hit = this.dataCache.find((c) => c.key === key);
    if (hit) {
      return of(hit.data);
    } else {
      return this.http
        .get<WeatherStationInfo[]>(`${integration.url}${daily ? '/daily' : ''}?apiKey=${integration.key}`)
        .pipe(
          tap((data: WeatherStationInfo[]) => {
            this.dataCache.push({
              key,
              data,
            });
          })
        );
    }
  }
}
