import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Action, ActionType, BBCHAction } from '../../models/action.model';
import * as moment from 'moment';
import { VarietyService } from '../../services/variety.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'app-bbch',
  templateUrl: './bbch.component.html',
  styleUrls: ['./bbch.component.scss'],
})
export class BbchComponent implements OnChanges {
  @Input()
  actions: Action[];

  summary = [];

  years = [];

  constructor(private varietyService: VarietyService, private utilService: UtilService) {
    this.years = [moment().year() - 1, moment().year()];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.actions) {
      this.summary = this.parseBBCHStages(this.actions);
    }
  }

  private parseBBCHStages(actions: Action[]) {
    const bbch: BBCHAction[] = actions
      .filter((a: Action) => a.type === ActionType.BBCH)
      .sort((a: Action, b: Action) => (a.date.isSameOrBefore(b.date) ? -1 : 1))
      .filter((a: Action) => {
        const normalizedCurrent = moment().set('year', a.date.year());
        const diff = normalizedCurrent.diff(a.date, 'days');
        return this.years.includes(a.date.year()) && diff >= 0;
      });
    const summary = [];
    for (const action of bbch) {
      const year = moment(action.date).year();
      for (const variety of action.variety || []) {
        const label = this.varietyService.getVarietyByID(variety)?.name;
        const hit = summary.find((s) => s.label === label);
        const bbchLabel = this.utilService.getBBCHDescription(action.bbch);
        if (!hit) {
          summary.push({
            label,
            [year]: {
              bbch: bbchLabel,
              value: action.bbch,
              date: action.date,
            },
          });
        } else if (!hit[year] || moment(hit[year].date).isBefore(action.date)) {
          hit[year] = {
            bbch: bbchLabel,
            value: action.bbch,
            date: action.date,
          };
        }
      }
    }
    console.log(summary);
    return summary.map((v) => {
      const codes: number[] = this.years.map((y) => (v[y] ? v[y].value : undefined)).filter((d) => !!d);
      const diff = codes.length > 1 ? codes[1].toString().localeCompare(codes[0].toString()) : 0;
      return {
        ...v,
        diff,
      };
    });
  }
}
