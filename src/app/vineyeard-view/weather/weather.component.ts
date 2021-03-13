import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Vineyard} from '../../models/vineyard.model';
import {getCenter} from 'ol/extent';
import {transformExtent} from 'ol/proj';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnChanges {

  @Input()
  vineyard: Vineyard;

  public conditions: {date: string, icon: string, label: string}[] = [];

  constructor(
      private http: HttpClient
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this.getMeteoInfo(this.vineyard);
    }
  }

  getMeteoInfo(vineyard: Vineyard) {
    const location = this.getLocation(vineyard);
    console.log("LOCATION", location);
    this.http.get(`http://api.openweathermap.org/data/2.5/onecall?lon=${location[0]}&lat=${location[1]}&appid=${environment.owm_key}&cnt=5`)
        .subscribe((result: any) => {
          console.log(result);
          this.conditions = result.daily.map((entry) => ({
            date: new Date(entry.dt * 1000).toISOString(),
            label: `${entry.weather[0].description}`,
            icon: entry.weather[0].icon
          }));
        });
  }

  getLocation(vineyard: Vineyard): [number, number] {
    return getCenter(transformExtent(this.vineyard.location.getExtent(), 'EPSG:3857', 'EPSG:4326'));
  }
}
