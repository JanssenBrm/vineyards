import { UtilService } from './../../services/util.service';
import { LoadingController, Platform } from '@ionic/angular';
import { ActionType, BBCHAction, BrixAction } from './../../models/action.model';
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
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { WeatherStationInfo } from '../../models/weather.model';
import { VarietyService } from '../../services/variety.service';
import { FeaturesService } from '../../services/features.service';

enum StatTypes {
  ACTIONS = 'Actions',
  BBCH = 'BBCH',
  METEO = 'Meteo',
  DGD = 'Growing Days',
  BRIX = 'Brix',
  SUNHOURS = 'Sun Hours',
  HUMIDITY = 'Humidity',
}

const PREMIUM_TYPES: StatTypes[] = [StatTypes.METEO, StatTypes.DGD];

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

  public stats: { type: StatTypes; premium: boolean }[] = Object.keys(StatTypes)
    .filter((t) => ![StatTypes.SUNHOURS, StatTypes.HUMIDITY].includes(StatTypes[t]))
    .map((t: string) => ({
      type: StatTypes[t],
      premium: PREMIUM_TYPES.includes(StatTypes[t]),
    }));

  public activeStats: StatTypes[] = [StatTypes.ACTIONS];

  private _chart: Highcharts.Chart;

  private _loading: HTMLIonLoadingElement;

  private BASE_TEMP = 10.0;

  private loadStats: BehaviorSubject<void>;

  constructor(
    private utilService: UtilService,
    private vineyardService: VineyardService,
    private statService: StatisticsService,
    private titlecasePipe: TitleCasePipe,
    private platform: Platform,
    private colorService: ColorService,
    private integrationsService: IntegrationsService,
    private weatherStationService: WeatherStationService,
    private loadingController: LoadingController,
    private varietyService: VarietyService,
    private featureService: FeaturesService
  ) {
    this.loadStats = new BehaviorSubject<void>(undefined);

    this.loadStats.pipe(debounceTime(250)).subscribe({
      next: () => {
        if (this._chart) {
          this.clearCharts();
          this.setGraphData();
        }
      },
    });

    this.featureService
      .isUserPremium()
      .pipe(
        map((premium: boolean) => {
          if (!premium) {
            throw new Error('User is not premium');
          }
          return premium;
        })
      )
      .subscribe({
        error: () => {
          this.stats = this.stats.filter((s) => !s.premium);
        },
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.vineyard) {
      if (this.vineyard) {
        this.getStats();
      }
    }

    if (changes.varieties) {
      this.activeVarieties = this.varieties.map((v: Variety) => v.id);
    }

    if (changes.integrations) {
      const stats = [...this.stats];
      if (this.integrationsService.hasIntegration(IntegrationType.WEATHER_STATION)) {
        stats.push(
          ...[StatTypes.SUNHOURS, StatTypes.HUMIDITY].map((type: StatTypes) => ({
            type,
            premium: PREMIUM_TYPES.includes(type),
          }))
        );
      }
      this.stats = stats.filter((stat, idx, statarr) => statarr.findIndex((s) => s.type === stat.type) === idx);
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
        this._chart = Highcharts.stockChart('graph-container', { ...STATS_OPTIONS });
        this.setAxis();
      }

      this.loadStats.next();
    }
  }

  setAxis() {
    const axes = [
      ...this.getMeteoAxis(),
      this.getActionAxis(),
      ...this.getDgdAxis(),
      ...this.getBrixAxis(),
      ...this.getSunHoursAxis(),
      ...this.getHumidityAxis(),
      ...this.getBBCHAxis(),
    ];
    axes.forEach((a: any) => this._chart.addAxis(a));
  }

  setGraphData() {
    const requests: Observable<any>[] = [];

    if (this.activeStats.includes(StatTypes.ACTIONS)) {
      requests.push(this.getActionTimelines());
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

    if (this.activeStats.includes(StatTypes.SUNHOURS)) {
      requests.push(this.getWeatherStationSunHours());
    }

    if (this.activeStats.includes(StatTypes.HUMIDITY)) {
      requests.push(this.getWeatherStationHumidity());
    }

    if (this.activeStats.includes(StatTypes.BBCH)) {
      requests.push(this.getBBCHGraphs());
    }

    if (requests.length > 0) {
      from(this.presentLoading())
        .pipe(switchMap(() => merge(...requests)))
        .subscribe({
          next: (s: any) => {
            if (!!s && s.data?.length > 0) {
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

  getSunHoursAxis(): any[] {
    return [
      {
        id: 'sunhours',
        labels: {
          format: '{value} hours',
        },
        title: {
          text: 'Sun Hours',
        },
        opposite: false,
      },
    ];
  }

  getHumidityAxis(): any[] {
    return [
      {
        id: 'humidity',
        labels: {
          format: '{value} hours',
        },
        title: {
          text: 'Sun Hours',
        },
        opposite: false,
      },
    ];
  }

  getBBCHAxis(): any[] {
    return [
      {
        id: 'bbch',
        labels: {
          format: '{value}s',
        },
        title: {
          text: 'Stage',
        },
        opposite: false,
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

  getBBCHGraphs(): Observable<any[]> {
    const actions: BBCHAction[] = this.actions
      .filter((a: Action) => a.type === ActionType.BBCH)
      .sort((a: Action, b: Action) => (moment(a.date).isBefore(moment(b.date)) ? -1 : 1));
    const varieties = []
      .concat(...actions.map((a: Action) => a.variety))
      .filter((v: string, idx: number, vs: string[]) => this.activeVarieties.includes(v) && vs.indexOf(v) === idx)
      .map((v: string) => this.varietyService.getVarietyByID(v)?.name);
    const years: { year: number; variety: string }[] = [].concat(
      ...this.actions
        .filter((a: Action) => a.type === ActionType.BBCH)
        .map((a: Action) => moment(a.date).year())
        .filter((y: number, idx: number, ys: number[]) => ys.indexOf(y) === idx)
        .map((year: number) =>
          varieties.map((variety: string) => ({
            year,
            variety,
          }))
        )
    );

    return merge(
      [].concat(
        ...years
          .filter(({ year }) => this.seasons.indexOf(year) >= 0)
          .map(({ year, variety }, idx: number) => [
            {
              id: `BBCH ${year} - ${variety}`,
              name: `BBCH ${year} - ${variety}`,
              type: 'line',
              yAxis: 'bbch',
              step: true,
              color: this.colorService.darken(COLOR.BBCH, idx),
              showInNavigator: true,
              tooltip: {
                formatter: (point) => {
                  return `<span style="color:${
                    point.color
                  }">●</span>  <b>BBCH ${year} - ${variety}</b>: ${this.utilService.getBBCHDescription(
                    point.y.toString()
                  )}`;
                },
              },
              data: actions
                .filter(
                  (a: Action) =>
                    moment(a.date).year() === year &&
                    (a.variety || []).includes(this.varietyService.getVarietyByName(variety)?.id)
                )
                .map((a: BBCHAction) => ({
                  x: this.getNormalizedDate(moment(a.date).format('YYYY-MM-DD')),
                  y: +a.bbch,
                })),
            },
          ])
      )
    );
  }

  getActionTimelines(): Observable<any> {
    return merge(
      Object.keys(ActionType).map((a: string) => ({
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
              (action as BBCHAction).bbch
                ? (action as BBCHAction).bbch +
                  ' - ' +
                  this.utilService.getBBCHDescription((action as BBCHAction).bbch) +
                  '<br />'
                : ''
            }${(action as BrixAction).value ? (action as BrixAction).value + ' ' : ''}${action.description}`,
            x: this.getNormalizedDate(action.date),
            y: new Date(action.date).getFullYear(),
          })),
      }))
    );
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

  getWeatherStationData(daily: boolean = false): Observable<{ year: number; stats: WeatherStationInfo[] }> {
    const integration: Integration = this.integrationsService.getIntegration(IntegrationType.WEATHER_STATION);

    if (!integration) {
      return of({ year: undefined, stats: undefined });
    } else {
      return this.weatherStationService.readWeatherData(integration, daily).pipe(
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

  getWeatherStationSunHours(): Observable<any> {
    return this.getWeatherStationData().pipe(
      switchMap(({ year, stats }) => {
        return year && stats
          ? [
              {
                id: `Station Sunshine ${year} `,
                name: `Station Sunshine ${year}`,
                type: 'spline',
                yAxis: 'sunhours',
                color: COLOR.STATION_SUNHOURS,
                showInNavigator: true,
                tooltip: {
                  formatter(point) {
                    return `<span style="color:${point.color}">●</span>  <b>Station Sun Hours ${year}</b>: ${point.y} hours`;
                  },
                },
                data: stats
                  .filter((s: WeatherStationInfo) => moment(s.date).year() === year)
                  .map((e: WeatherStationInfo) => ({
                    x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DDTHH:mm:SS')),
                    y: e.sunhours,
                  })),
                dataGrouping: {
                  approximation: 'sum',
                },
              },
            ]
          : [];
      })
    );
  }

  getWeatherStationHumidity(): Observable<any> {
    return this.getWeatherStationData().pipe(
      switchMap(({ year, stats }) => {
        return year && stats
          ? [
              {
                id: `Station Humidity ${year} `,
                name: `Station Humidity ${year}`,
                type: 'spline',
                yAxis: 'humidity',
                color: COLOR.STATION_HUMIDITY,
                showInNavigator: true,
                tooltip: {
                  formatter(point) {
                    return `<span style="color:${point.color}">●</span>  <b>Station Humidity ${year}</b>: ${point.y}`;
                  },
                },
                data: stats
                  .filter((s: WeatherStationInfo) => moment(s.date).year() === year)
                  .map((e: WeatherStationInfo) => ({
                    x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DDTHH:mm:SS')),
                    y: e.humidity,
                  })),
                dataGrouping: {
                  approximation: 'average',
                },
              },
            ]
          : [];
      })
    );
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
                color: COLOR.STATION_TEMP,
                showInNavigator: true,
                tooltip: {
                  formatter(point) {
                    return `<span style="color:${point.color}">●</span>  <b>Station Temperature ${year}</b>: ${point.y} °C`;
                  },
                },
                data: stats
                  .filter((s: WeatherStationInfo) => moment(s.date).year() === year)
                  .map((e: WeatherStationInfo) => ({
                    x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DDTHH:mm:SS')),
                    y: e.temperature,
                  })),
                dataGrouping: {
                  approximation: 'average',
                },
              },
            ]
          : [];
      })
    );
  }

  getWeatherStationDGDGraphs(): Observable<any> {
    let degreeDaysSum = 0;
    return this.getWeatherStationData(true).pipe(
      switchMap(({ year, stats }) => {
        return year && stats
          ? [
              {
                id: `Station Degree days ${year}`,
                name: `Station Degree days ${year}`,
                type: 'spline',
                yAxis: 'degreedays',
                color: COLOR.STATION_GDD,
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
    const varieties = []
      .concat(...this.actions.map((a: Action) => a.variety))
      .filter((v: string, idx: number, vs: string[]) => vs.indexOf(v) === idx);
    const combinations: { year: number; variety: string }[] = [].concat(
      ...years.map((y: number) => {
        return varieties
          .filter((v: string) =>
            this.actions.find((a: Action) => a.variety?.includes(v) && moment(a.date).year() === y)
          )
          .map((v: string) => ({
            year: y,
            variety: v,
          }));
      })
    );
    return merge(
      [].concat(
        ...combinations
          .filter(({ year, variety }) => this.seasons.indexOf(year) >= 0 && this.activeVarieties.includes(variety))
          .map(({ year, variety }, idx: number) => {
            const varietyName = this.varietyService.getVarietyByID(variety).name;
            return [
              {
                id: `${varietyName} - Degrees Brix ${year}`,
                name: `${varietyName} - Degrees Brix ${year}`,
                type: 'spline',
                yAxis: 'brix',
                color: this.colorService.lighten(COLOR.BRIX, idx),
                showInNavigator: true,
                tooltip: {
                  formatter(point) {
                    return `<span style="color:${
                      point.color
                    }">●</span>  <b>${varietyName} - Degrees Brix ${year}</b>: ${point.y.toFixed(2)} Degrees`;
                  },
                },
                data: this.actions
                  .filter(
                    (a: BrixAction) =>
                      moment(a.date).year() === year &&
                      a.variety?.includes(variety) &&
                      a.type === ActionType.Brix &&
                      !!a.value
                  )
                  .map((a: BrixAction) => ({
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
    await this._loading.present();
  }

  hideLoading() {
    this._loading.dismiss().then(() => {
      console.log('Hide loading');
    });
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
