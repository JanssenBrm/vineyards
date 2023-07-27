import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Action, ActionType } from '../models/action.model';
import { ActionService } from './action.service';
import { MeteoStatEntry } from '../models/vineyard.model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class SeasonsService {
  private _seasons: BehaviorSubject<number[]>;

  private _activeSeasons: BehaviorSubject<number[]>;

  constructor(private fireStore: AngularFirestore, private actionService: ActionService) {
    this._activeSeasons = new BehaviorSubject<number[]>([]);
    this._seasons = new BehaviorSubject<number[]>([]);
    this.actionService
      .getActionListener()
      .pipe(
        map((actions: Action[]) =>
          actions.length > 0
            ? [moment().year(), ...actions.map((a: Action) => a.date.year())].filter(
                (y, idx, years) => years.indexOf(y) === idx
              )
            : []
        ),
        tap((years: number[]) => {
          if (years.length > 0 && this._activeSeasons.getValue().length === 0) {
            const seasons = [years[0]];
            if (years.length > 1) {
              seasons.push(years[1]);
            }
            this.setActiveSeasons(seasons);
          }

          if (years.length > 0 && this._seasons.getValue().length === 0) {
            this._seasons.next(years);
          }
        })
      )
      .subscribe();
    this._activeSeasons = new BehaviorSubject<number[]>([]);
  }

  public getSeasonListener(): BehaviorSubject<number[]> {
    return this._seasons;
  }

  public getActiveSeasonListener(): BehaviorSubject<number[]> {
    return this._activeSeasons;
  }

  public setActiveSeasons(seasons: number[]): void {
    this._activeSeasons.next(seasons);
  }

  public calculateGrowingSeason(
    year: number,
    stats: MeteoStatEntry[],
    actions: Action[]
  ): [moment.Moment, moment.Moment] {
    const yStats: MeteoStatEntry[] = stats.filter((s: MeteoStatEntry) => s.date.year() === year);
    const harvested: moment.Moment = actions
      .filter((a: Action) => a.date.year() === year)
      .find((a: Action) => a.type === ActionType.Harvest)?.date;
    const frozenPeriod = [moment(`${year}-04-01`), moment(`${year}-06-01`)];
    let start = moment(`${year}-04-01`);
    let frozen = yStats
      .filter((e: MeteoStatEntry) => e.date.isSameOrAfter(frozenPeriod[0]) && e.date.isSameOrBefore(frozenPeriod[1]))
      .filter((e: MeteoStatEntry) => e.tmin < 0)
      .reverse();

    return [
      // eslint-disable-next-line import/namespace
      frozen.length ? moment.max([start, frozen[0].date]) : start,
      harvested ? harvested : yStats[yStats.length - 1].date,
    ];
  }
}
