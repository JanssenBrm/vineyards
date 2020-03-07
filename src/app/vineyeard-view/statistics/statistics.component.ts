import { STATS_OPTIONS } from './../../conf/statistics.config';
import { StatisticsService } from './../../services/statistics.service';
import { VineyardService } from './../../services/vineyard.service';
import { Vineyard } from './../../models/vineyard.model';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Action } from 'src/app/models/action.model';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, OnChanges {

  @Input()
  vineyard: Vineyard;

  @Input()
  seasons: number[];

  constructor(private vineyardService: VineyardService, private statService: StatisticsService) { }

  private _chart: Highcharts.Chart;

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.vineyard) || (changes.seasons) && this.vineyard) {
      this.getStats();
    }
  }

  getStats(): void {
    console.log('Get stats');
    this._chart = Highcharts.chart('graph-container', STATS_OPTIONS);
    this.getActionHistory().forEach((s: any) => this._chart.addSeries(s));
  }

  getActionHistory(): any[] {
    return this.seasons.map((s: number) => ({
      name: `Action History - ${s}`,
      data: this.vineyardService.getActions(this.vineyard, [s]).map((a: Action) => [this.getNormalizedDate(a.date), 1]),
      tooltip: {
        formatter() {
          return `${Highcharts.dateFormat('%e %b', this.x)}: ${this.y}`;
        }
      }
    }));
  }

  getNormalizedDate(date: string): number {
    const actDate: Date = new Date(date);
    actDate.setFullYear(2000);
    return actDate.getTime();
  }

}
