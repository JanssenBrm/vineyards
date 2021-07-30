import {UtilService} from './../../services/util.service';
import {Platform} from '@ionic/angular';
import {ActionType} from './../../models/action.model';
import {STATS_OPTIONS} from './../../conf/statistics.config';
import {StatisticsService} from './../../services/statistics.service';
import {VineyardService} from './../../services/vineyard.service';
import {MeteoStatEntry, Vineyard} from './../../models/vineyard.model';
import {Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import {Action} from 'src/app/models/action.model';
import {TitleCasePipe} from '@angular/common';
import * as moment from 'moment';
import {Variety} from '../../models/variety.model';

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

    @Input()
    actions: Action[];

    @Input()
    varieties: Variety[];

    @ViewChild('content', {static: false})
    content: ElementRef;

    public activeVarieties: string[];

    constructor(private utilService: UtilService, private vineyardService: VineyardService, private statService: StatisticsService, private titlecasePipe: TitleCasePipe, private platform: Platform) {
    }

    private _chart: Highcharts.Chart;

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes.vineyard) || (changes.seasons)) {
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
            if (this._chart) {
                this._chart.series.forEach(s => s.remove(false));
            } else {
                this._chart = Highcharts.stockChart('graph-container', STATS_OPTIONS);
                [this.getActionAxis()/* ...this.getMeteoAxis(), ...this.getAgriAxis()*/].forEach((a: any) => this._chart.addAxis(a));
            }
            //[(...this.getMeteoTimelines),...this.getAgriTimelines()].forEach((s: any) => this._chart.addSeries(s));
            this.updateActionStats();
        }
    }

    updateActionStats() {
        this._chart.series.filter(s => s.type === 'scatter').forEach(s => s.remove(false));
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
            opposite: false
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
                opposite: false
            },
            {
                id: 'precipitation',
                labels: {
                    format: '{value} mm',
                },
                title: {
                    text: 'Precipitation',
                },
                opposite: false
            }];
    }

    getAgriAxis(): any[] {
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
            }];
    }

    getActionTimelines(): any[] {
        const result = Object.keys(ActionType).map((a: string) => ({
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
            data: this.actions
                .filter((action: Action) => action.type === ActionType[a])
                .filter((action: Action) => this.seasons.indexOf(new Date(action.date).getFullYear()) >= 0 && this.activeVarieties.filter(v => action.variety.indexOf(v) >= 0).length > 0)
                .map((action: Action) => ({
                    label: `${action.bbch ? action.bbch + ' - ' + this.utilService.getBBCHDescription(action.bbch) + '<br />' : ''}${action.description}`,
                    x: this.getNormalizedDate(action.date),
                    y: new Date(action.date).getFullYear()
                }))
        }));
        return result;
    }

    getMeteoTimelines(): any[] {
        const years = this.vineyardService.getMeteoYears(this.vineyard);
        return [].concat(...years.filter((y: number) => this.seasons.indexOf(y) >= 0).map((y: number) => ([{
            id: `Temperature ${y}`,
            name: `Temperature ${y}`,
            type: 'spline',
            yAxis: 'temperature',
            color: 'red',
            showInNavigator: true,
            tooltip: {
                formatter(point) {
                    return `<span style="color:${point.color}">●</span>  <b>Temperature ${y}</b>: ${point.y} °C`;
                },
            },
            data: this.vineyardService.getMeteoByYears(this.vineyard, [y]).map((e: MeteoStatEntry) => ({
                x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
                y: e.temp
            }))
        },
            {
                id: `Precipitation ${y}`,
                name: `Precipitation ${y}`,
                type: 'bar',
                yAxis: 'precipitation',
                color: 'lightblue',
                showInNavigator: true,
                tooltip: {
                    formatter(point) {
                        return `<span style="color:${point.color}">●</span>  <b>Precipitation ${y}</b>: ${point.y.toFixed(2)} mm`;
                    },
                },
                data: this.vineyardService.getMeteoByYears(this.vineyard, [y]).map((e: MeteoStatEntry) => ({
                    x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
                    y: e.precip
                }))
            }])));
    }

    getAgriTimelines(): any[] {
        const baseTemp = 10.0;
        const years = this.vineyardService.getMeteoYears(this.vineyard);
        let degreeDaysSum = 0;
        return [].concat(...years.filter((y: number) => this.seasons.indexOf(y) >= 0).map((y: number) => ([{
            id: `Degree days ${y}`,
            name: `Degree days ${y}`,
            type: 'spline',
            yAxis: 'degreedays',
            color: 'darkred',
            showInNavigator: true,
            tooltip: {
                formatter(point) {
                    return `<span style="color:${point.color}">●</span>  <b>Degree days ${y}</b>: ${point.y.toFixed(2)} GGD`;
                },
            },
            data: this.vineyardService.getMeteoByYears(this.vineyard, [y]).filter((e: MeteoStatEntry) => e.temp >= baseTemp).map((e: MeteoStatEntry, idx: number, array: MeteoStatEntry[]) => ({
                date: e.date,
                value: Math.ceil((e.temp - baseTemp) * 100) / 100
            })).map((e: { date: string, value: number }, idx: number, results: ({ date: string, value: number })[]) => {
                degreeDaysSum += e.value;
                return {
                    x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
                    y: degreeDaysSum
                };
            })
        }])));
    }

    getNormalizedDate(date: string): number {
        const actDate: Date = new Date(date);
        actDate.setFullYear(2000);
        return actDate.getTime();
    }

    setVarieties() {
        this.updateActionStats();
    }

}
