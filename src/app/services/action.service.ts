import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import {Vineyard} from '../models/vineyard.model';
import {VineyardDoc} from '../models/vineyarddoc.model';
import {map, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {Action} from '../models/action.model';
import {User} from 'firebase';
import {AuthService} from './auth.service';
export const ACTION_COLLECTION = 'actions';

@Injectable({
  providedIn: 'root'
})
export class ActionService {

  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;
  private _actions: BehaviorSubject<Action[]>;

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {
    this._actions = new BehaviorSubject<Action[]>([]);
    this.authService.getUser().subscribe((user: User) => {
      if (user) {
        this._vineyardCollection = fireStore.collection<VineyardDoc>(`users/${user.uid}/vineyards`);
      }
    });
  }

  public getActionListener(): BehaviorSubject<Action[]> {
    return this._actions;
  }

  public addAction(vineyard: Vineyard, action: Action): void {
    this._vineyardCollection.doc(vineyard.id).collection<Action>(ACTION_COLLECTION).add(action);
  }

  public updateAction(vineyard: Vineyard, action: Action): void {
    this._vineyardCollection.doc(vineyard.id).collection<Action>(ACTION_COLLECTION).doc(action.id).set(action);
  }

  public removeAction(vineyard: Vineyard, action: Action): void {
    this._vineyardCollection.doc(vineyard.id).collection<Action>(ACTION_COLLECTION).doc(action.id).delete();
  }

  public getActions(vineyard: Vineyard): void {
    this._vineyardCollection.doc(vineyard.id).collection<Action>(ACTION_COLLECTION).snapshotChanges().pipe(
        map((data: DocumentChangeAction<Action>[]) => data.map((d: DocumentChangeAction<Action>) => (
            {
              ...d.payload.doc.data(),
              id: d.payload.doc.id,
            }))),
        map((actions: Action[]) => actions.sort((a1: Action, a2: Action) => (new Date(a1.date).getTime()) < (new Date(a2.date).getTime()) ? 1 : -1))
    ).subscribe((actions: Action[]) => this._actions.next(actions));
  }

  public getLastUpdate(actions: Action[]): string {
    const action = actions && actions.length > 0 ? actions[actions.length - 1] : undefined;
    return action ? action.date : undefined;
  }
}
