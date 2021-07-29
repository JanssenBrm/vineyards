import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Vineyard} from '../../models/vineyard.model';
import {Vintage} from '../../models/vintage.model';
import {BehaviorSubject, combineLatest, concat, Observable, of} from 'rxjs';
import {Note} from '../../models/note.model';
import {SINGLE_DATES, VintageEvent, VINTAGEEVENT_COLORS} from '../../models/vintageevent.model';
import {NotesService} from '../../services/notes.service';
import {ModalController} from '@ionic/angular';
import {skipWhile, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {VintageTimeLineEntry} from '../../models/vintagetimelineentry.model';
import * as moment from 'moment';
import {Chart} from 'chart.js';

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnChanges {

    @ViewChild('timelineChart', {static: false}) timelineChart;

    @Input()
    vineyard: Vineyard;

    @Input()
    vintage: Vintage;

    legend: { color: string, label: string }[] = [];
    totalDays: number;

    public STAGE = VintageEvent;

    private chart: Chart;

    private containerReady: BehaviorSubject<boolean>;

    constructor(
        private notesService: NotesService,
        private modalController: ModalController
    ) {
    }

    createChart(notes: Note[]) {
        if (notes.length > 0) {
            this.chart = new Chart(this.timelineChart.nativeElement, {
                type: 'scatter',
                data: {
                    datasets: Object.keys(this.STAGE)
                        .filter((stage: string) => notes.filter((n: Note) => n.stage === stage).length > 0)
                        .map((stage: string, idx: number) => ({
                            label: stage,
                            data: notes
                                .filter((n: Note) => n.stage === stage)
                                .map((n: Note) => ({
                                    x: moment(n.date),
                                    y: stage,
                                    description: n.description
                                })),
                            borderColor: VINTAGEEVENT_COLORS[idx],
                            borderWidth: 10,
                            pointBackgroundColor: VINTAGEEVENT_COLORS[idx],
                            pointBorderColor: VINTAGEEVENT_COLORS[idx],
                            pointRadius: 1,
                            pointHoverRadius: 1,
                            fill: false,
                            tension: 0,
                            showLine: !SINGLE_DATES.includes(this.STAGE[stage]),
                        }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: {
                        titleFontStyle: 'bold',
                        callbacks: {
                            title: (tooltipItem, data) => {
                                const points = data.datasets[tooltipItem[0].datasetIndex].data;
                                const start = moment(new Date(points[tooltipItem[0].index].x));
                                return `${this.STAGE[tooltipItem[0].value]} - ${start.format('DD MMM YYYY')}`;
                            },
                            label: (tooltipItem, data) => {
                                const points = data.datasets[tooltipItem.datasetIndex].data;
                                return `${points[tooltipItem.index].description.substring(0, 50)}...`;
                            }
                        }
                    },
                    legendCallback: (chart) => {
                        return chart.data.datasets.map(d => ({
                            color: d.borderColor,
                            label: SINGLE_DATES.includes((this.STAGE[d.label] as VintageEvent)) ? this.STAGE[d.label] : `${this.STAGE[d.label]} (${this.getMaxDate(notes, d.label).diff(this.getMinDate(notes, d.label), 'days')} days) `
                        }));
                    },
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            type: 'category',
                            labels: ['', ...Object.keys(this.STAGE).map((stage: string) => stage), ''],
                            ticks: {
                                display: false
                            }
                        }],
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'DD MMM'
                                }
                            },
                            ticks: {
                                autoSkip: true,
                                maxRotation: 90,
                                minRotation: 90
                            }
                        }]
                    }
                }
            });
            this.chart.resize();
            this.legend = this.chart.generateLegend();
        } else {
            if (this.chart) {
                this.chart.destroy();
            }
        }
    }

    getMaxDate(notes: Note[], stage: VintageEvent): moment.Moment {
        const dates = this.getStageDates(notes, stage);
        return dates[dates.length - 1];
    }

    getMinDate(notes: Note[], stage: VintageEvent): moment.Moment {
        return this.getStageDates(notes, stage)[0];
    }

    getStageDates(notes: Note[], stage: VintageEvent): moment.Moment[] {
        return notes
            .filter((n: Note) => n.stage === stage).map((n: Note) => moment(n.date))
            .sort((d1: moment.Moment, d2: moment.Moment) => d1.isSameOrBefore(d2) ? -1 : 1);
    }

    calculateTotalDays(notes: Note[]): number {
        const dates = notes.map((n: Note) => moment(n.date))
            .sort((d1: moment.Moment, d2: moment.Moment) => d1.isSameOrBefore(d2) ? -1 : 1);
        return dates.length > 0 ? dates[dates.length - 1].diff(dates[0], 'days') : 0;
    }

    ngOnInit() {
        this.containerReady = new BehaviorSubject<boolean>(false);
        this.checkContainerReady();

        combineLatest(
            this.containerReady.pipe(
                skipWhile((value) => !value)
            ),
            this.notesService.getNotesListener()
        ).subscribe((value) => {
            this.createChart(value[1]);
            this.totalDays = this.calculateTotalDays(value[1]);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.notesService.getNotes(this.vineyard, this.vintage);
    }

    checkContainerReady() {
        this.containerReady.next(!!this.timelineChart);
        if (!this.timelineChart) {
            setTimeout(() => {
                this.checkContainerReady();
            }, 500);
        }
    }



}
