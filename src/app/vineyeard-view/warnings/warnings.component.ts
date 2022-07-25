import { Component, Input } from '@angular/core';
import { Vineyard } from '../../models/vineyard.model';
import { WeatherService } from '../../services/weather.service';
import { WeatherInfo } from '../../models/weather.model';
import { Warning, WarningType } from '../../models/warning.model';
import * as moment from 'moment';

@Component({
  selector: 'app-warnings',
  templateUrl: './warnings.component.html',
  styleUrls: ['./warnings.component.scss'],
})
export class WarningsComponent {
  @Input()
  vineyard: Vineyard;

  warnings: Warning[] = [];

  WARNING_TYPE = WarningType;

  dates: string[];

  constructor(private weatherService: WeatherService) {
    this.weatherService.getConditions().subscribe((info: WeatherInfo[]) => {
      if (info.length > 0) {
        this.calculateMeteoWarnings(info);
      }
    });
  }

  calculateMeteoWarnings(info: WeatherInfo[]) {
    this.updateWarnings(WarningType.FROST, this.getFrostWarnings(info));
  }

  private getFrostWarnings(info: WeatherInfo[]): Warning[] {
    return info
      .filter((i: WeatherInfo) => Math.round(i.temp.min) < 0)
      .map((i: WeatherInfo) => ({
        type: WarningType.FROST,
        date: i.date,
        description: `Freezing temperatures of ${Math.round(i.temp.min)}°C detected`,
      }));
  }

  private updateWarnings(type: WarningType, newWarnings: Warning[]) {
    const oldWarnings = this.warnings.filter((w: Warning) => w.type !== type);
    this.warnings = [...oldWarnings, ...newWarnings].sort((w1: Warning, w2: Warning) =>
      moment(w1.date).isSameOrBefore(moment(w2.date)) ? -1 : 1
    );
    this.dates = this.warnings
      .map((w: Warning) => moment(w.date))
      .filter(
        (d1: moment.Moment, idx: number, dates: moment.Moment[]) =>
          dates.findIndex((d: moment.Moment) => d.isSame(d1)) === idx
      )
      .map((d: moment.Moment) => d.toISOString());
  }

  public getWarningsForDate(date: string): Warning[] {
    return this.warnings.filter((w: Warning) => moment(w.date).isSame(moment(date)));
  }
}
