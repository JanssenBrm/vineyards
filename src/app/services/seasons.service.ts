import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, tap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Action} from '../models/action.model';
import {ActionService} from './action.service';


@Injectable({
    providedIn: 'root'
})
export class SeasonsService {

    private _seasons: BehaviorSubject<number[]>;
    private _activeSeasons: BehaviorSubject<number[]>;

    constructor(private fireStore: AngularFirestore, private actionService: ActionService) {
        this._activeSeasons = new BehaviorSubject<number[]>([]);
        this._seasons = new BehaviorSubject<number[]>([]);
        this.actionService.getActionListener()
            .pipe(
                map((actions: Action[]) => [...new Set(actions.map((a: Action) => new Date(a.date).getFullYear()))]),
                tap((years: number[]) => {
                    if (years.length > 0 && this._activeSeasons.getValue().length === 0) {
                        this.setActiveSeasons([years[0]]);
                    }
                    if (years.length > 0 && this._seasons.getValue().length === 0) {
                        this._seasons.next(years);
                    }
                })
            ).subscribe();
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
