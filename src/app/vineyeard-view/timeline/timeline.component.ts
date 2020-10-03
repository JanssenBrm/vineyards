import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Vineyard} from '../../models/vineyard.model';
import {Vintage} from '../../models/vintage.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Note} from '../../models/note.model';
import {VintageStage} from '../../models/stage.model';
import {NotesService} from '../../services/notes.service';
import {ModalController} from '@ionic/angular';
import {switchMap} from 'rxjs/operators';
import {VinetageTimeLineEntry} from '../../models/vintagetimelineentry.model';
import * as moment from 'moment';
import {Chart} from 'chart.js';

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements AfterViewInit, OnChanges {

    @ViewChild('timelineChart', {static: false}) timelineChart;

    @Input()
    vineyard: Vineyard;

    @Input()
    vintage: Vintage;

    public STAGE = VintageStage;

    private chart: Chart;

    constructor(
        private notesService: NotesService,
        private modalController: ModalController
    ) {
    }

    createChart(entries: VinetageTimeLineEntry[]) {
        const colors = [
            'rgb(255, 205, 86)',
            'rgb(255, 159, 64)',
            'rgb(255, 99, 132)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)'
        ];
        if (entries.length > 0) {
            console.log(entries, entries.map((e: VinetageTimeLineEntry) => ({
                data: [{
                    x: e.start.toDate(),
                    y: e.stage
                },
                    {
                        x: e.end.toDate(),
                        y: e.stage
                    }]
            })));
            this.chart = new Chart(this.timelineChart.nativeElement, {
                type: 'scatter',
                responsive: true,
                maintainAspectRatio: false,
                data: {
                    datasets: entries.map((e: VinetageTimeLineEntry, idx: number) => ({
                        data: [{
                            x: e.start.toDate(),
                            y: this.STAGE[e.stage]
                        }, {
                            x: e.end.toDate(),
                            y: this.STAGE[e.stage]
                        }],
                        borderColor: colors[idx],
                        borderWidth: 10,
                        pointBackgroundColor: colors[idx],
                        pointBorderColor: colors[idx],
                        pointRadius: 1,
                        pointHoverRadius: 1,
                        fill: false,
                        tension: 0,
                        showLine: true,
                    }))
                },
                options: {
                    tooltips: {
                        callbacks: {
                            label: (tooltipItem, data) => `${tooltipItem.value} - ${moment(new Date(tooltipItem.xLabel)).format('DD MMM YYYY')}`
                        }
                    },
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            type: 'category',
                            labels: ['', ...entries.map((e: VinetageTimeLineEntry) => this.STAGE[e.stage]), '']
                        }],
                        xAxes: [{
                            type: 'time',
                            time: {
                                displayFormats: {
                                    quarter: 'MMM YYYY'
                                }
                            }
                        }]
                    }
                }
            });
            this.chart.resize();
        }
    }

    getMaxDate(notes: Note[], stage: VintageStage): moment.Moment {
        const dates = this.getStageDates(notes, stage);
        return dates[dates.length - 1];
    }

    getMinDate(notes: Note[], stage: VintageStage): moment.Moment {
        return this.getStageDates(notes, stage)[0];
    }

    getStageDates(notes: Note[], stage: VintageStage): moment.Moment[] {
        return notes
            .filter((n: Note) => n.stage === stage).map((n: Note) => moment(n.date))
            .sort((d1: moment.Moment, d2: moment.Moment) => d1.isSameOrBefore(d2) ? -1 : 1);
    }

    ngAfterViewInit() {
        this.notesService.getNotesListener().pipe(
            switchMap((notes: Note[]) =>
                of(notes
                    .map((note: Note) => ({
                        stage: note.stage,
                        start: this.getMinDate(notes, note.stage),
                        end: this.getMaxDate(notes, note.stage),
                    }))
                    .filter((entry: VinetageTimeLineEntry, idx: number, array: VinetageTimeLineEntry[]) => array.findIndex((search: VinetageTimeLineEntry) => search.stage === entry.stage) === idx)
                ))).subscribe((entries: VinetageTimeLineEntry[]) => {
            console.log('ENTRIES', entries);
            this.createChart(entries);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.timelineChart) {
            this.notesService.getNotes(this.vineyard, this.vintage);
        }
    }


}
