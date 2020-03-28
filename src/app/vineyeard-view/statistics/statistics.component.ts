import { UtilService } from './../../services/util.service';
import { Platform } from '@ionic/angular';
import { ActionType } from './../../models/action.model';
import { STATS_OPTIONS } from './../../conf/statistics.config';
import { StatisticsService } from './../../services/statistics.service';
import { VineyardService } from './../../services/vineyard.service';
import { Vineyard } from './../../models/vineyard.model';
import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { Action } from 'src/app/models/action.model';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnChanges {

  @Input()
  vineyard: Vineyard;

  @Input()
  seasons: number[];

  @ViewChild('content', {static: false})
  content: ElementRef;

  constructor(private utilService: UtilService, private vineyardService: VineyardService, private statService: StatisticsService, private titlecasePipe: TitleCasePipe, private platform: Platform) { }

  private _chart: Highcharts.Chart;

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.vineyard) || (changes.seasons) && this.vineyard) {
      this.getStats();
    }
  }

  ngAfterViewInit() {
    this.updateChartSize();
    this.platform.ready().then(() => {
      this.platform.resize.subscribe(() => {
        this.updateChartSize();
      });
    });
  }

  updateChartSize() {
    if (this._chart) {
      this._chart.redraw();
      this._chart.reflow();
    }
  }

  getStats(): void {
    this._chart = Highcharts.chart('graph-container', STATS_OPTIONS);
    this._chart.addAxis(this.getActionAxis());
    this.getActionTimelines().forEach((s: any) => this._chart.addSeries(s));
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
        text: `${a.bbch ? this.utilService.getBBCHDescription(a.bbch) + '<br />' : ''} ${a.description}`
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
          symbol: `url(/assets/icon/${a.toLowerCase()}_graph.png)`,
          width: 24,
          height: 24,
          fillColor: '#FFFFFF',
          lineWidth: 2,
          lineColor: '#FFFFFF'
        },
        data: this.vineyardService.getActionsByType(this.vineyard, [ActionType[a]])
        .filter((action: Action) => this.seasons.indexOf(new Date(action.date).getFullYear()) >= 0)
        .map((action: Action) => ({
          label: `${action.bbch ? action.bbch + ' - ' + this.utilService.getBBCHDescription(action.bbch) + '<br />' : ''}${action.description}`,
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
