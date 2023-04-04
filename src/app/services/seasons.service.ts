import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Action } from '../models/action.model';
import { ActionService } from './action.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
            ? [new Date().getFullYear(), ...actions.map((a: Action) => new Date(a.date).getFullYear())].filter(
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
}
