import { ActionType } from './../../models/action.model';
import { STATS_OPTIONS } from './../../conf/statistics.config';
import { StatisticsService } from './../../services/statistics.service';
import { VineyardService } from './../../services/vineyard.service';
import { Vineyard } from './../../models/vineyard.model';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { Action } from 'src/app/models/action.model';
import { TitleCasePipe } from '@angular/common';

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

  constructor(private vineyardService: VineyardService, private statService: StatisticsService, private titlecasePipe: TitleCasePipe) { }

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
    this._chart.addAxis(this.getActionAxis());
    // this.getActionHistory().forEach((s: any) => this._chart.addSeries(s));
    console.log('UPDATING STATS', this.seasons);
    this.getActionTimelines().forEach((s: any) => this._chart.addSeries(s));
    console.log(this._chart);
  }

  getActionHistory(): any[] {
    return this.seasons.map((s: number) => ({
      name: `Action History - ${s}`,
      type : 'flags',
      marker: {
        symbol: 'circle'
      },
      data: this.vineyardService.getActionsByYear(this.vineyard, [s]).map((a: Action) => ({
        x: this.getNormalizedDate(a.date),
        title: `${s} - ${this.titlecasePipe.transform(a.type)}`,
        text: a.description
      }))
    }));
  }

  getActionAxis(): any {
    return {
      id: 'actions',
      labels: {
          format: '{value}',
      },
      title: {
          text: 'Years',
      },
      categories: this.seasons,
    };
  }

  getActionTimelines(): any[] {
    return Object.keys(ActionType).map((a: string) => ({
        name: `${a}`,
        type: 'scatter',
        yAxis: 'actions',
        marker: {
          symbol: `url(/assets/icon/${a.toLowerCase()}.png)`,
          width: 16,
          height: 16,
          fillColor: '#FFFFFF',
          lineWidth: 2,
          lineColor: '#FFFFFF'
        },
        data: this.vineyardService.getActionsByType(this.vineyard, [ActionType[a]])
        .filter((action: Action) => this.seasons.indexOf(new Date(action.date).getFullYear()) >= 0)
        .map((action: Action) => ({
          label: `${action.description}`,
          x: this.getNormalizedDate(action.date),
          y: new Date(action.date).getFullYear()
        }))
    }));
  }

  getNormalizedDate(date: string): number {
    const actDate: Date = new Date(date);
    actDate.setFullYear(2000);
    return actDate.getTime();
  }

}
