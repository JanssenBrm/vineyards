import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import {Vineyard} from '../models/vineyard.model';
import {VineyardDoc} from '../models/vineyarddoc.model';
import {map, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {Action} from '../models/action.model';
import {ActionService} from './action.service';


@Injectable({
    providedIn: 'root'
})
export class SeasonsService {

    private _seasons: Observable<number[]>;
    private _activeSeasons: BehaviorSubject<number[]>;

    constructor(private fireStore: AngularFirestore, private actionService: ActionService) {
        this._seasons = this.actionService.getActionListener()
            .pipe(
                map((actions: Action[]) => [...new Set(actions.map((a: Action) => new Date(a.date).getFullYear()))]),
                tap((years: number[]) => {
                        if (years.length > 0 && this._activeSeasons.getValue().length === 0) {
                            this.setActiveSeasons([years[0]]);
                        }
                })
            );
        this._activeSeasons = new BehaviorSubject<number[]>([]);
    }

    public getSeasonListener(): Observable<number[]> {
        return this._seasons;
    }

    public getActiveSeasonListener(): BehaviorSubject<number[]> {
        return this._activeSeasons;
    }

    public setActiveSeasons(seasons: number[]): void {
        this._activeSeasons.next(seasons);
    }
}
