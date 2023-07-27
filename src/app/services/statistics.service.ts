import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { VineyardDoc } from '../models/vineyarddoc.model';
import { BehaviorSubject } from 'rxjs';
import { Action } from '../models/action.model';
import { AuthService } from './auth.service';
import { User } from 'firebase';
import { MeteoStatEntry, MeteoStats, Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import * as moment from 'moment/moment';
import { SeasonsService } from './seasons.service';

export const STATS_COLLECTION = 'stats';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;

  private _meteoStats: BehaviorSubject<MeteoStatEntry[]>;

  private BASE_TEMP = 10.0;

  constructor(
    private fireStore: AngularFirestore,
    private authService: AuthService,
    private seasonService: SeasonsService
  ) {
    this._meteoStats = new BehaviorSubject<MeteoStatEntry[]>([]);
    this.authService.getUser().subscribe((user: User) => {
      if (user) {
        this._vineyardCollection = fireStore.collection<VineyardDoc>(`users/${user.uid}/vineyards`);
      }
    });
  }

  public getMeteoListener(): BehaviorSubject<MeteoStatEntry[]> {
    return this._meteoStats;
  }

  public getMeteoStats(vineyard: Vineyard): void {
    this._vineyardCollection
      .doc(vineyard.id)
      .collection<any>(STATS_COLLECTION)
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
    const actDate: Date = date.toDate();
    actDate.setFullYear(2000);
    return actDate.getTime();
  }
}
