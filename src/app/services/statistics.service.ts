import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { VineyardDoc } from '../models/vineyarddoc.model';
import { BehaviorSubject } from 'rxjs';
import { Action, ACTION_COLORS, ActionType } from '../models/action.model';
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
      .pipe(map((data) => (data.payload.data() as MeteoStats)?.data || []))
      .subscribe((entries: MeteoStatEntry[]) => this._meteoStats.next(entries));
  }

  public getLastUpdate(actions: Action[]): string {
    const action = actions && actions.length > 0 ? actions[actions.length - 1] : undefined;
    return action ? action.date : undefined;
  }

  getActionTypeColor(stage: string): string {
    const idx = Object.keys(ActionType).findIndex((s: string) => s === stage);
    return idx >= 0 ? ACTION_COLORS[idx] : undefined;
  }

  findActionType(type: string): string {
    return Object.keys(ActionType).find((s: string) => ActionType[s] === type);
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
      .map((e: { date: string; value: number }) => {
        degreeDaysSum += e.value;
        return {
          x: this.getNormalizedDate(moment(e.date).format('YYYY-MM-DD')),
          y: degreeDaysSum,
        };
      });
  }

  getNormalizedDate(date: string): number {
    const actDate: Date = new Date(date);
    actDate.setFullYear(2000);
    return actDate.getTime();
  }
}
