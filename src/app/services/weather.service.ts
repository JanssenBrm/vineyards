import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {WeatherInfo} from '../models/weather.model';
import {Vineyard} from '../models/vineyard.model';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {VineyardService} from './vineyard.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private conditions$: BehaviorSubject<WeatherInfo[]>;

  constructor( private http: HttpClient, private vineyardService: VineyardService) {
    this.conditions$ = new BehaviorSubject<WeatherInfo[]>([]);
  }

  getConditions(): BehaviorSubject<WeatherInfo[]> {
    return this.conditions$;
  }

  loadConditions(vineyard: Vineyard): BehaviorSubject<WeatherInfo[]> {
    const location = this.vineyardService.getLocation(vineyard);
    this.http.get(`https://api.openweathermap.org/data/2.5/onecall?lon=${location[0]}&lat=${location[1]}&appid=${environment.owm_key}&cnt=5&units=metric`)
        .subscribe((result: any) => {
          const conditions: WeatherInfo[] = result.daily.map((entry) => ({
            date: new Date(entry.dt * 1000).toISOString(),
            label: `${entry.weather[0].description}`,
            icon: entry.weather[0].icon,
            temp: {
              min: entry.temp.min,
              max: entry.temp.max
            }
          }));
          this.conditions$.next(conditions);
        });
    return this.conditions$;
  }
}
