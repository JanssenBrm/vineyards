import { UtilService } from './../../services/util.service';
import { LoadingController, Platform } from '@ionic/angular';
import { ActionType } from './../../models/action.model';
import { STATS_OPTIONS } from './../../conf/statistics.config';
import { StatisticsService } from './../../services/statistics.service';
import { VineyardService } from './../../services/vineyard.service';
import { MeteoStatEntry, Vineyard } from './../../models/vineyard.model';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { Action } from 'src/app/models/action.model';
import { TitleCasePipe } from '@angular/common';
import * as moment from 'moment';
import { Variety } from '../../models/variety.model';
import { COLOR, ColorService } from '../../services/color.service';
import { Integration, IntegrationType } from '../../models/integration.model';
import { IntegrationsService } from '../../services/integrations.service';
import { WeatherStationService } from '../../services/weatherstation.service';
import { from, merge, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WeatherStationInfo } from '../../models/weather.model';

enum StatTypes {
  ACTIONS = 'Actions',
  METEO = 'Meteo',
  DGD = 'Growing Days',
  BRIX = 'Brix',
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements AfterViewInit, OnChanges {
  @Input()
  vineyard: Vineyard;

  @Input()
  seasons: number[];

  @Input()
  actions: Action[];

  @Input()
  varieties: Variety[];

  @Input()
  integrations: Integration[];

  @ViewChild('content')
  content: ElementRef;

  public activeVarieties: string[];

  public stats = Object.values(StatTypes);

  public activeStats: StatTypes[] = [StatTypes.ACTIONS];

  private _chart: Highcharts.Chart;

  private _loading: HTMLIonLoadingElement;

  private BASE_TEMP = 10.0;

  constructor(
    private utilService: UtilService,
    private vineyardService: VineyardService,
    private statService: StatisticsService,
    private titlecasePipe: TitleCasePipe,
    private platform: Platform,
    private colorService: ColorService,
    private integrationsService: IntegrationsService,
    private weatherStationService: WeatherStationService,
    private loadingController: LoadingController
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.vineyard || changes.seasons) {
      if (this.vineyard) {
        this.activeVarieties = this.varieties.map((v: Variety) => v.id);
        this.getStats();
      }
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
    if (this.vineyard) {
      if (!this._chart) {
        this._chart = Highcharts.stockChart('graph-container', STATS_OPTIONS);
        this.setAxis();
      }
      this.clearCharts();

      this.setGraphData();
    }
  }

  setAxis() {
    const axes = [...this.getMeteoAxis(), this.getActionAxis(), ...this.getDgdAxis(), ...this.getBrixAxis()];
    axes.forEach((a: any) => this._chart.addAxis(a));
  }

  setGraphData() {
    const requests: Observable<any>[] = [];

    if (this.activeStats.includes(StatTypes.ACTIONS)) {
      this.updateActionStats();
    }

    if (this.activeStats.includes(StatTypes.METEO)) {
      requests.push(this.getWeatherStationMeteoGraphs(), this.getMeteoTimelines());
    }

    if (this.activeStats.includes(StatTypes.DGD)) {
      requests.push(this.getWeatherStationDGDGraphs(), this.getDgdTimelines());
    }

    if (this.activeStats.includes(StatTypes.BRIX)) {
      requests.push(this.getBrixTimelines());
    }

    if (requests.length > 0) {
      from(this.presentLoading())
        .pipe(switchMap(() => merge(...requests)))
        .subscribe({
          next: (s: any) => {
            if (!!s) {
              this._chart.addSeries(s);
            }
          },
          error: (error: any) => {
            console.error('Could not fetch data series', error);
            this.hideLoading();
          },
          complete: () => {
            this.hideLoading();
          },
        });
    }
  }

  clearCharts() {
    while (this._chart.series.length) {
      this._chart.series[0].remove(false, false, false);
    }
  }

  updateActionStats() {
    this._chart.series.filter((s) => s.type === 'scatter').forEach((s) => s.remove(false));
    [...this.getActionTimelines()].forEach((s: any) => this._chart.addSeries(s));
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
      opposite: false,
    };
  }

  getMeteoAxis(): any[] {
    return [
      {
        id: 'temperature',
        labels: {
          format: '{value} °C',
        },
        title: {
          text: 'Temperature',
        },
        opposite: false,
      },
      {
        id: 'precipitation',
        labels: {
          format: '{value} mm',
        },
        title: {
          text: 'Precipitation',
        },
        opposite: false,
      },
    ];
  }

  getDgdAxis(): any[] {
    return [
      {
        id: 'degreedays',
        labels: {
          format: '{value} GGD',
        },
        title: {
          text: 'Degree days',
        },
        opposite: true,
      },
    ];
  }

  getBrixAxis(): any[] {
    return [
      {
        id: 'brix',
        labels: {
          format: '{value} degrees',
        },
        title: {
          text: 'Degree Brix',
        },
        opposite: true,
      },
    ];
  }

  getActionTimelines(): any[] {
    const result = Object.keys(ActionType).map((a: string) => ({
      name: `${a}`,
      type: 'scatter',
      yAxis: 'actions',
      marker: {
        symbol: `url(/assets/icon/${a.toLowerCase()}.png)`,
        width: 24,
        height: 24,
        fillColor: '#FFFFFF',
        lineWidth: 2,
        lineColor: '#FFFFFF',
      },
      data: this.actions
        .filter((action: Action) => action.type === ActionType[a])
        .filter(
          (action: Action) =>
            this.seasons.indexOf(new Date(action.date).getFullYear()) >= 0 &&
            this.activeVarieties.filter((v) => action.variety.indexOf(v) >= 0).length > 0
        )
        .map((action: Action) => ({
          label: `${
            action.bbch ? action.bbch + ' - ' + this.utilService.getBBCHDescription(action.bbch) + '<br />' : ''
          }${action.value ? action.value + ' ' : ''}${action.description}`,
          x: this.getNormalizedDate(action.date),
          y: new Date(action.date).getFullYear(),
        })),
    }));
    return result;
  }

  getMeteoTimelines(): Observable<any> {
    const stats: MeteoStatEntry[] = this.statService.getMeteoListener().getValue();
    const years = stats
      .map((s: MeteoStatEntry) => moment(s.date).year())
      .filter((y: number, idx: number, ys: number[]) => ys.indexOf(y) === idx);

    return merge(
      [].concat(
        ...years
          .filter((y: number) => this.seasons.indexOf(y) >= 0)
          .map((y: number, idx: number) => [
            {
              id: `Temperature ${y}`,
              name: `Temperature ${y}`,
              type: 'spline',
              yAxis: 'temperature',
              color: this.colorService.darken(COLOR.TEMP, idx),
              showInNavigator: true,
              tooltip: {
                formatter(point) {
                  return `<span style="color:${point.color}">●</span>  <b>Temperature ${y}</b>: ${point.y} °C`;
                },
              },
              data: stats
                .filter((s: MeteoStatEntry) => moment(s.date).year() === y)
                .map((e: MeteoStatEntry) => ({
                  x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
                  y: e.tavg,
                })),
            },
            {
              id: `Precipitation ${y}`,
              name: `Precipitation ${y}`,
              type: 'bar',
              yAxis: 'precipitation',
              color: this.colorService.darken(COLOR.PERCIP, idx),
              showInNavigator: true,
              tooltip: {
                formatter(point) {
                  return `<span style="color:${point.color}">●</span>  <b>Precipitation ${y}</b>: ${point.y.toFixed(
                    2
                  )} mm`;
                },
              },
              data: stats
                .filter((s: MeteoStatEntry) => moment(s.date).year() === y)
                .map((e: MeteoStatEntry) => ({
                  x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
                  y: e.prcp,
                })),
            },
          ])
      )
    );
  }

  getWeatherStationData(): Observable<{ year: number; stats: WeatherStationInfo[] }> {
    const integration: Integration = this.integrationsService.getIntegration(IntegrationType.WEATHER_STATION);

    if (!integration) {
      return of({ year: undefined, stats: undefined });
    } else {
      return this.weatherStationService.readWeatherData(integration).pipe(
        switchMap((stats: WeatherStationInfo[]) => {
          const years = stats
            .map((s: WeatherStationInfo) => moment(s.date).year())
            .filter((y: number) => this.seasons.indexOf(y) >= 0)
            .filter((y: number, idx: number, ys: number[]) => ys.indexOf(y) === idx);

          return years.map((year: number) => ({
            year,
            stats: stats.filter((s: WeatherStationInfo) => moment(s.date).year() === year),
          }));
        })
      );
    }
  }

  getWeatherStationMeteoGraphs(): Observable<any> {
    return this.getWeatherStationData().pipe(
      switchMap(({ year, stats }) => {
        return year && stats
          ? [
              {
                id: `Station Temperature ${year} `,
                name: `Station Temperature ${year}`,
                type: 'spline',
                yAxis: 'temperature',
                color: this.colorService.darken(COLOR.TEMP, 5),
                showInNavigator: true,
                tooltip: {
                  formatter(point) {
                    return `<span style="color:${point.color}">●</span>  <b>Station Temperature ${year}</b>: ${point.y} °C`;
                  },
                },
                data: stats
                  .filter((s: WeatherStationInfo) => moment(s.date).year() === year)
                  .map((e: WeatherStationInfo) => ({
                    x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
                    y: e.temperature,
                  })),
              },
            ]
          : [];
      })
    );
  }

  getWeatherStationDGDGraphs(): Observable<any> {
    let degreeDaysSum = 0;
    return this.getWeatherStationData().pipe(
      switchMap(({ year, stats }) => {
        return year && stats
          ? [
              {
                id: `Station Degree days ${year}`,
                name: `Station Degree days ${year}`,
                type: 'spline',
                yAxis: 'degreedays',
                color: COLOR.GDD,
                showInNavigator: true,
                tooltip: {
                  formatter(point) {
                    return `<span style="color:${
                      point.color
                    }">●</span>  <b>Station Degree days ${year}</b>: ${point.y.toFixed(2)} GGD`;
                  },
                },
                data: stats
                  .filter((s: WeatherStationInfo) => moment(s.date).year() === year)
                  .filter((e: WeatherStationInfo) => e.temperature >= this.BASE_TEMP)
                  .map((e: WeatherStationInfo) => ({
                    date: e.date,
                    value: Math.ceil((e.temperature - this.BASE_TEMP) * 100) / 100,
                  }))
                  .map((e: { date: string; value: number }) => {
                    degreeDaysSum += e.value;
                    return {
                      x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
                      y: degreeDaysSum,
                    };
                  }),
              },
            ]
          : [];
      })
    );
  }

  getDgdTimelines(): Observable<any> {
    const stats: MeteoStatEntry[] = this.statService.getMeteoListener().getValue();
    const years = stats
      .map((s: MeteoStatEntry) => moment(s.date).year())
      .filter((y: number, idx: number, ys: number[]) => ys.indexOf(y) === idx);
    let degreeDaysSum = 0;
    return merge(
      [].concat(
        ...years
          .filter((y: number) => this.seasons.indexOf(y) >= 0)
          .map((y: number, idx: number) => {
            degreeDaysSum = 0;
            return [
              {
                id: `Degree days ${y}`,
                name: `Degree days ${y}`,
                type: 'spline',
                yAxis: 'degreedays',
                color: this.colorService.darken(COLOR.GDD, idx),
                showInNavigator: true,
                tooltip: {
                  formatter(point) {
                    return `<span style="color:${point.color}">●</span>  <b>Degree days ${y}</b>: ${point.y.toFixed(
                      2
                    )} GGD`;
                  },
                },
                data: stats
                  .filter((s: MeteoStatEntry) => moment(s.date).year() === y)
                  .filter((e: MeteoStatEntry) => e.tavg >= this.BASE_TEMP)
                  .map((e: MeteoStatEntry) => ({
                    date: e.date,
                    value: Math.ceil((e.tavg - this.BASE_TEMP) * 100) / 100,
                  }))
                  .map((e: { date: string; value: number }) => {
                    degreeDaysSum += e.value;
                    return {
                      x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
                      y: degreeDaysSum,
                    };
                  }),
              },
            ];
          })
      )
    );
  }

  getBrixTimelines(): Observable<any> {
    const years = this.actions
      .map((a: Action) => moment(a.date).year())
      .filter((y: number, idx: number, ys: number[]) => ys.indexOf(y) === idx);
    return merge(
      [].concat(
        ...years
          .filter((y: number) => this.seasons.indexOf(y) >= 0)
          .map((y: number, idx: number) => {
            return [
              {
                id: `Degrees Brix ${y}`,
                name: `Degrees Brix ${y}`,
                type: 'spline',
                yAxis: 'brix',
                color: this.colorService.lighten(COLOR.BRIX, idx),
                showInNavigator: true,
                tooltip: {
                  formatter(point) {
                    return `<span style="color:${point.color}">●</span>  <b>Degrees Brix ${y}</b>: ${point.y.toFixed(
                      2
                    )} Degrees`;
                  },
                },
                data: this.actions
                  .filter((a: Action) => moment(a.date).year() === y && a.type === ActionType.Brix && !!a.value)
                  .map((a: Action) => ({
                    date: a.date,
                    value: a.value,
                  }))
                  .map((e: { date: string; value: number }) => {
                    return {
                      x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DDTHH:mm:SS')),
                      y: e.value,
                    };
                  }),
              },
            ];
          })
      )
    );
  }

  async presentLoading() {
    this._loading = await this.loadingController.create({
      message: 'Retrieving data...',
    });
    this._loading.present();
  }

  async hideLoading() {
    this._loading.dismiss();
  }

  getNormalizedDate(date: string): number {
    const actDate: Date = new Date(date);
    actDate.setFullYear(2000);
    return actDate.getTime();
  }

  setVarieties() {
    this.getStats();
  }
}
