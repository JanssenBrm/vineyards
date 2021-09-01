import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import {VineyardDoc} from '../models/vineyarddoc.model';
import {BehaviorSubject} from 'rxjs';
import {Action, ACTION_COLORS, ActionType} from '../models/action.model';
import {AuthService} from './auth.service';
import {User} from 'firebase';
import {MeteoStatEntry, MeteoStats, Vineyard} from '../models/vineyard.model';
import {map} from 'rxjs/operators';
import {ACTION_COLLECTION} from './action.service';
import {MeteoStat} from '../../../functions/src/models/stats.model';

export const STATS_COLLECTION = 'stats';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;
  private _meteoStats: BehaviorSubject<MeteoStatEntry[]>;

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {
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
    this._vineyardCollection.doc(vineyard.id).collection<any>(STATS_COLLECTION)
        .doc('meteo').snapshotChanges().pipe(
        map((data) => (data.payload.data() as MeteoStats).data),
    ).subscribe((entries: MeteoStatEntry[]) => this._meteoStats.next(entries));
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
}
