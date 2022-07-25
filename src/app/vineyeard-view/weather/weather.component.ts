import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Vineyard } from '../../models/vineyard.model';

import { HttpClient } from '@angular/common/http';
import { WeatherInfo } from '../../models/weather.model';
import { WeatherService } from '../../services/weather.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnChanges {
  @Input()
  vineyard: Vineyard;

  public conditions: BehaviorSubject<WeatherInfo[]>;

  constructor(private http: HttpClient, private weatherService: WeatherService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this.getMeteoInfo(this.vineyard);
    }
  }

  getMeteoInfo(vineyard: Vineyard) {
    this.conditions = this.weatherService.loadConditions(vineyard);
  }
}
