import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { Vineyard } from '../models/vineyard.model';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { Action, ACTION_COLORS, ActionType, BaseAction, BaseActionDoc } from '../models/action.model';
import { UtilService } from './util.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class ActionService {
  private _actions: BehaviorSubject<Action[]>;

  constructor(private fireStore: AngularFirestore) {
    this._actions = new BehaviorSubject<Action[]>([]);
  }

  public getActionListener(): BehaviorSubject<Action[]> {
    return this._actions;
  }

  public async addAction(vineyard: Vineyard, action: BaseAction): Promise<Action> {
    const doc = await this.fireStore
      .collection<BaseActionDoc>(this.getVineyardActionsCollectionPath(vineyard))
      .add(this.convertToDoc(action));
    return {
      ...action,
      id: doc.id,
      html: UtilService.parseMarkdown(action.description),
    };
  }

  public async updateAction(vineyard: Vineyard, action: BaseAction): Promise<Action> {
    await this.fireStore
      .collection<BaseActionDoc>(this.getVineyardActionsCollectionPath(vineyard))
      .doc(action.id)
      .set(this.convertToDoc(action));
    return {
      ...action,
      html: UtilService.parseMarkdown(action.description),
    };
  }

  private getVineyardActionsCollectionPath(vineyard: Vineyard): string {
    return `users/${vineyard.owner}/vineyards/${vineyard.id}/actions`;
  }

  private convertToDoc(action: BaseAction): BaseActionDoc {
    return {
      ...action,
      date: action.date.toISOString(),
    };
  }

  public async removeAction(vineyard: Vineyard, action: BaseAction): Promise<void> {
    await this.fireStore
      .collection<BaseActionDoc>(this.getVineyardActionsCollectionPath(vineyard))
      .doc(action.id)
      .delete();
  }

  public getActions(vineyard: Vineyard): void {
    this.fireStore
      .collection<BaseActionDoc>(this.getVineyardActionsCollectionPath(vineyard))
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<BaseActionDoc>[]) =>
          data.map((d: DocumentChangeAction<BaseActionDoc>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        ),
        map((actions: BaseActionDoc[]) =>
          actions.map((a) => ({
            ...a,
            date: moment(a.date),
          }))
        ),
        map((actions: BaseAction[]) =>
          [...actions].sort((a1: BaseAction, a2: BaseAction) => (a1.date.isSameOrBefore(a2.date) ? 1 : -1))
        ),
        map((actions: BaseAction[]) =>
          actions.map((a: BaseAction) => ({
            ...a,
            html: UtilService.parseMarkdown(a.description),
          }))
        ),
        catchError((error: any) => {
          console.error(`Could not fetch actions from vineyard ${vineyard.id}`, error);
          return of([]);
        })
      )
      .subscribe((actions: Action[]) => this._actions.next(actions));
  }

  public getLastUpdate(actions: BaseAction[]): moment.Moment {
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
