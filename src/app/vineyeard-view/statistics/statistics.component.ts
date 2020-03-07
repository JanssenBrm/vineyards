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

  constructor(private vineyardService: VineyardService, private statService: StatisticsService) { }

  seasons: number[];
  activeSeasons: number[];

  private _chart: Highcharts.Chart;

  ngOnInit() {
    this.activeSeasons = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.vineyard && this.vineyard) {
      this.seasons = this.vineyardService.getYears(this.vineyard);
      this.activeSeasons = [this.seasons[this.seasons.length - 1]];
      this.getStats();
    }
  }

  getStats(): void {
    console.log('Get stats');
    this._chart = Highcharts.chart('graph-container', STATS_OPTIONS);
    this._chart.addSeries(this.getActionHistory());
  }

  getActionHistory(): any {
    return {
      name: 'Action History',
      data: this.vineyardService.getActions(this.vineyard, this.activeSeasons).map((a: Action) => [new Date(a.date).getTime(), a.type]),
      tooltip: {
        formatter() {
          return `${Highcharts.dateFormat('%d %M %y', this.x)}: ${this.y}`;
        }
      },
    };
  }



  updateSeasons(): void {
    if (this.activeSeasons.length == 0) {
      this.activeSeasons = [this.seasons[this.seasons.length - 1]];
    }
    this.getStats();
  }

}
