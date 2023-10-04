import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Action } from '../models/action.model';
import { MeteoStatEntry, MeteoStats, Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import * as moment from 'moment/moment';
import { SeasonsService } from './seasons.service';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private _meteoStats: BehaviorSubject<MeteoStatEntry[]>;

  private BASE_TEMP = 10.0;

  constructor(private fireStore: AngularFirestore, private seasonService: SeasonsService) {
    this._meteoStats = new BehaviorSubject<MeteoStatEntry[]>([]);
  }

  private getVineyardMeteoCollectionPath(vineyard: Vineyard): string {
    return `users/${vineyard.owner}/vineyards/${vineyard.id}/stats`;
  }

  public getMeteoListener(): BehaviorSubject<MeteoStatEntry[]> {
    return this._meteoStats;
  }

  public getMeteoStats(vineyard: Vineyard): void {
    this.fireStore
      .collection(this.getVineyardMeteoCollectionPath(vineyard))
      .doc('meteo')
      .snapshotChanges()
      .pipe(
        map((data) => (data.payload.data() as MeteoStats)?.data || []),
        map((entries: MeteoStatEntry[]) =>
          entries.map((e: MeteoStatEntry) => ({
            ...e,
            date: moment(e.date),
          }))
        )
      )
      .subscribe((entries: MeteoStatEntry[]) => this._meteoStats.next(entries));
  }

  calculateDgdSeries(year: number, stats: MeteoStatEntry[], actions: Action[]) {
    const season: [moment.Moment, moment.Moment] = this.seasonService.calculateGrowingSeason(year, stats, actions);
    let degreeDaysSum = 0;
    return stats
      .filter(
        (s: MeteoStatEntry) => moment(s.date).isSameOrAfter(season[0]) && moment(s.date).isSameOrBefore(season[1])
      )
      .filter((e: MeteoStatEntry) => e.tavg >= this.BASE_TEMP)
      .map((e: MeteoStatEntry) => ({
        date: e.date,
        value: Math.ceil((e.tavg - this.BASE_TEMP) * 100) / 100,
      }))
      .map((e: { date: moment.Moment; value: number }) => {
        degreeDaysSum += e.value;
        return {
          x: this.getNormalizedDate(e.date),
          y: degreeDaysSum,
        };
      });
  }

  getNormalizedDate(date: moment.Moment): number {
    let actDate: moment.Moment = date.clone();
    const utcOffsetInMinutes = actDate.utcOffset();
    actDate = actDate.set({ year: 2000 });
    actDate = actDate.add(utcOffsetInMinutes, 'minutes');
    return actDate.unix() * 1000;
  }
}
