import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentChangeAction,
  DocumentReference,
} from '@angular/fire/compat/firestore';
import { Vineyard } from '../models/vineyard.model';
import { VineyardDoc } from '../models/vineyarddoc.model';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Action, ActionType, PlantingAction } from '../models/action.model';
import { Variety } from '../models/variety.model';
import { AuthService } from './auth.service';
import { Vintage } from '../models/vintage.model';
import { ActionService } from './action.service';
import firebase from 'firebase/compat';
import { Injectable } from '@angular/core';

export const VARIETY_COLLECTION = 'varieties';

@Injectable({
  providedIn: 'root',
})
export class VarietyService {
  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;

  private _varieties: BehaviorSubject<Variety[]>;

  constructor(
    private fireStore: AngularFirestore,
    private actionService: ActionService,
    private authService: AuthService
  ) {
    this._varieties = new BehaviorSubject<Variety[]>([]);
    this.authService.getUser().subscribe((user: firebase.User) => {
      if (user) {
        this._vineyardCollection = fireStore.collection<VineyardDoc>(`users/${user.uid}/vineyards`);
      }
    });
  }

  public getVarietyListener(): BehaviorSubject<Variety[]> {
    return this._varieties;
  }

  public addVariety(vineyard: Vineyard, variety: Variety): Promise<string> {
    return this._vineyardCollection
      .doc(vineyard.id)
      .collection<Variety>(VARIETY_COLLECTION)
      .add(variety)
      .then((doc: DocumentReference) => doc.id);
  }

  public updateVariety(vineyard: Vineyard, variety: Variety): void {
    this._vineyardCollection.doc(vineyard.id).collection<Variety>(VARIETY_COLLECTION).doc(variety.id).set(variety);
  }

  public removeVaerity(vineyard: Vineyard, variety: Variety): void {
    this._vineyardCollection.doc(vineyard.id).collection<Variety>(VARIETY_COLLECTION).doc(variety.id).delete();
  }

  public getVarietyByName(name: string): Variety {
    return this._varieties.getValue().find((v: Variety) => v.name === name);
  }

  public getVarietyByID(id: string): Variety {
    return this._varieties.getValue().find((v: Variety) => v.id === id);
  }

  public getVarieties(vineyard: Vineyard): void {
    this._vineyardCollection
      .doc(vineyard.id)
      .collection<Variety>(VARIETY_COLLECTION)
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<Variety>[]) =>
          data.map((d: DocumentChangeAction<Variety>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        )
      )
      .subscribe((actions: Variety[]) => this._varieties.next(actions));
  }

  public getPlantCount(varieties: Variety[]): number {
    const ids = varieties.map((v: Variety) => v.id);
    const actions: PlantingAction[] = this.actionService
      .getActionListener()
      .getValue()
      .filter((a: Action) => a.type === ActionType.Planting && ids.includes(a.variety[0])) as PlantingAction[];
    return varieties.length > 0
      ? []
          .concat(
            ...varieties.map((v: Variety) =>
              actions
                .filter((a: PlantingAction) => a.variety[0] === v.id)
                .map((a: PlantingAction) => a.plantsPerRow * a.rows)
            )
          )
          .reduce((sum: number, count: number) => sum + count, 0)
      : 0;
  }

  getVariety(ids: string[]): Variety[] {
    return this._varieties.getValue().filter((v: Variety) => ids.indexOf(v.id) >= 0);
  }

  getVarietiesLabel(action: Action): string {
    return this.getVariety(action.variety)
      .map((v: Variety) => v.name)
      .join(', ');
  }

  getVintageVarietiesLabel(vintage: Vintage): string {
    return vintage.varieties.map((v: string) => this.getVarietyByID(v).name).join(',');
  }
}
