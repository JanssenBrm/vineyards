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
import { Chart } from 'chart.js';

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements AfterViewInit, OnChanges{

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

    createChart() {
        if (!this.chart) {
            console.log(this.timelineChart);
            this.chart = new Chart(this.timelineChart.nativeElement, {
                type: 'bar',
                data: {
                    labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
                    datasets: [{
                        label: 'Viewers in millions',
                        data: [2.5, 3.8, 5, 6.9, 6.9, 7.5, 10, 17],
                        backgroundColor: 'rgb(38, 194, 129)', // array should have same number of elements as number of dataset
                        borderColor: 'rgb(38, 194, 129)',// array should have same number of elements as number of dataset
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
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
            console.log("ENTRIES", entries);
            this.createChart();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.timelineChart) {
            this.notesService.getNotes(this.vineyard, this.vintage);
        }
    }



}
