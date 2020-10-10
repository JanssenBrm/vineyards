import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Vineyard} from '../../models/vineyard.model';
import {Vintage} from '../../models/vintage.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Note} from '../../models/note.model';
import {SINGLE_DATES, VintageEvent} from '../../models/vintageevent.model';
import {NotesService} from '../../services/notes.service';
import {ModalController} from '@ionic/angular';
import {switchMap} from 'rxjs/operators';
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

    public STAGE = VintageEvent;

    private chart: Chart;

    constructor(
        private notesService: NotesService,
        private modalController: ModalController
    ) {
    }

    createChart(notes: Note[]) {
        const colors = [
            'rgb(255, 205, 86)',
            'rgb(255, 159, 64)',
            'rgb(255, 99, 132)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)'
        ];
        if (notes.length > 0) {
            this.chart = new Chart(this.timelineChart.nativeElement, {
                type: 'scatter',
                data: {
                    datasets: Object.keys(this.STAGE)
                        .filter((stage: string) => notes.filter((n: Note) => n.stage === stage).length > 0)
                        .map((stage: string, idx: number) => ({
                            label: this.STAGE[stage],
                            data: notes
                                .filter((n: Note) => n.stage === stage)
                                .map((n: Note) => ({
                                    x: moment(n.date),
                                    y: this.STAGE[stage],
                                    description: n.description
                                })),
                            borderColor: colors[idx],
                            borderWidth: 10,
                            pointBackgroundColor: colors[idx],
                            pointBorderColor: colors[idx],
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
                                return tooltipItem[0].value;
                            },
                            label: (tooltipItem, data) => {
                                const points = data.datasets[tooltipItem.datasetIndex].data;
                                const start = moment(new Date(points[tooltipItem.index].x));
                                return `${start.format('DD MMM YYYY')} - ${points[tooltipItem.index].description.substring(0, 50)}...`;
                            }
                        }
                    },
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            type: 'category',
                            labels: ['', ...Object.keys(this.STAGE).map((stage: string) => this.STAGE[stage]), '']
                        }],
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'DD MMM YYYY'
                                }
                            },
                        }]
                    }
                }
            });
            this.chart.resize();
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

    ngOnInit() {
        this.notesService.getNotesListener().subscribe((notes: Note[]) => {
            this.createChart(notes);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.notesService.getNotes(this.vineyard, this.vintage);
    }


}
