import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Vineyard } from '../../models/vineyard.model';
import { Vintage } from '../../models/vintage.model';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { NoteBase } from '../../models/note.model';
import { SINGLE_DATES, VintageEvent, VINTAGEEVENT_COLORS } from '../../models/vintageevent.model';
import { NotesService } from '../../services/notes.service';
import { skipWhile } from 'rxjs/operators';
import * as moment from 'moment';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnChanges {
  @ViewChild('timelineChart') timelineChart;

  @Input()
  vineyard: Vineyard;

  @Input()
  vintage: Vintage;

  legend: { color: string; label: string }[] = [];

  totalDays: number;

  public STAGE = VintageEvent;

  private chart: Chart;

  private containerReady: BehaviorSubject<boolean>;

  constructor(private notesService: NotesService) {}

  createChart(notes: NoteBase[]) {
    if (notes.length > 0) {
      this.chart = new Chart(this.timelineChart.nativeElement, {
        type: 'scatter',
        data: {
          datasets: Object.keys(this.STAGE)
            .filter((stage: string) => notes.filter((n: NoteBase) => n.stage === stage).length > 0)
            .map((stage: string, idx: number) => ({
              label: stage,
              data: notes
                .filter((n: NoteBase) => n.stage === stage)
                .map((n: NoteBase) => ({
                  x: moment(n.date),
                  y: stage,
                  description: n.description,
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
            .map((serie: any) => {
              if (serie.label === VintageEvent.RESTING) {
                serie.data.push({
                  x: this.getLastRestingDate(notes),
                  y: serie.label,
                });
              }
              return serie;
            }),
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
              },
            },
          },
          legendCallback: (chart) => {
            return chart.data.datasets.map((d) => ({
              color: d.borderColor,
              label: SINGLE_DATES.includes(this.STAGE[d.label] as VintageEvent)
                ? this.formatStageLabel(this.STAGE[d.label])
                : `${this.formatStageLabel(this.STAGE[d.label])} (${this.getMaxDate(notes, d.label).diff(
                    this.getMinDate(notes, d.label),
                    'days'
                  )} days) `,
            }));
          },
          legend: {
            display: false,
          },
          scales: {
            yAxes: [
              {
                type: 'category',
                labels: ['', ...Object.keys(this.STAGE).map((stage: string) => stage), ''],
                ticks: {
                  display: false,
                },
              },
            ],
            xAxes: [
              {
                type: 'time',
                time: {
                  unit: 'day',
                  displayFormats: {
                    day: 'DD MMM',
                  },
                },
                ticks: {
                  autoSkip: true,
                  maxRotation: 90,
                  minRotation: 90,
                },
              },
            ],
          },
        },
      });
      this.chart.resize();
      this.legend = this.chart.generateLegend();
    } else {
      if (this.chart) {
        this.chart.destroy();
      }
    }
  }

  private formatStageLabel(stage: string) {
    return stage.replace('_', ' ');
  }

  isStillResting(notes: NoteBase[]): boolean {
    return !notes.find((n: NoteBase) => n.stage === VintageEvent.BOTTLING);
  }

  getLastRestingDate(notes: NoteBase[]): moment.Moment {
    if (this.isStillResting(notes)) {
      return moment();
    } else {
      return moment(notes.filter((n: NoteBase) => n.stage === VintageEvent.BOTTLING)[0].date);
    }
  }

  getMaxDate(notes: NoteBase[], stage: VintageEvent): moment.Moment {
    if (stage === VintageEvent.RESTING) {
      return this.getLastRestingDate(notes);
    } else {
      const dates = this.getStageDates(notes, stage);
      return dates[dates.length - 1];
    }
  }

  getMinDate(notes: NoteBase[], stage: VintageEvent): moment.Moment {
    return this.getStageDates(notes, stage)[0];
  }

  getStageDates(notes: NoteBase[], stage: VintageEvent): moment.Moment[] {
    return notes
      .filter((n: NoteBase) => n.stage === stage)
      .map((n: NoteBase) => moment(n.date))
      .sort((d1: moment.Moment, d2: moment.Moment) => (d1.isSameOrBefore(d2) ? -1 : 1));
  }

  calculateTotalDays(notes: NoteBase[]): number {
    let dates: moment.Moment[] = notes
      .sort((n1: NoteBase, n2: NoteBase) => (moment(n1.date).isSameOrBefore(moment(n2.date)) ? -1 : 1))
      .map((n: NoteBase) => moment(n.date));

    let bottlingNote = notes.findIndex((n: NoteBase) => n.stage === VintageEvent.BOTTLING);

    if (bottlingNote > 0) {
      dates = dates.slice(0, bottlingNote);
    } else {
      dates.push(moment());
    }

    return dates.length > 0 ? dates[dates.length - 1].diff(dates[0], 'days') : 0;
  }

  ngOnInit() {
    this.containerReady = new BehaviorSubject<boolean>(false);
    this.checkContainerReady();

    combineLatest([
      this.containerReady.pipe(skipWhile((value) => !value)),
      this.notesService.getNotesListener(),
    ]).subscribe((value) => {
      this.createChart(value[1]);
      this.totalDays = this.calculateTotalDays(value[1]);
    });
  }

  ngOnChanges() {
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
