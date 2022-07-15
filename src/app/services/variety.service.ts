import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, DocumentReference} from '@angular/fire/firestore';
import {Vineyard} from '../models/vineyard.model';
import {VineyardDoc} from '../models/vineyarddoc.model';
import {map, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {Action} from '../models/action.model';
import {Variety} from '../models/variety.model';
import {User} from 'firebase';
import {AuthService} from './auth.service';
import {Vintage} from '../models/vintage.model';
export const VARIETY_COLLECTION = 'varieties';

@Injectable({
  providedIn: 'root'
})
export class VarietyService {

  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;
  private _varieties: BehaviorSubject<Variety[]>;

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {
    this._varieties = new BehaviorSubject<Variety[]>([]);
    this.authService.getUser().subscribe((user: User) => {
      if (user) {
        this._vineyardCollection = fireStore.collection<VineyardDoc>(`users/${user.uid}/vineyards`);
      }
    });
  }

  public getVarietyListener(): BehaviorSubject<Variety[]> {
    return this._varieties;
  }

  public addVariety(vineyard: Vineyard, variety: Variety): Promise<string> {
    return this._vineyardCollection.doc(vineyard.id).collection<Variety>(VARIETY_COLLECTION).add(variety)
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
    this._vineyardCollection.doc(vineyard.id).collection<Variety>(VARIETY_COLLECTION).snapshotChanges().pipe(
        map((data: DocumentChangeAction<Variety>[]) => data.map((d: DocumentChangeAction<Variety>) => (
            {
              ...d.payload.doc.data(),
              id: d.payload.doc['id']
            }))),
    ).subscribe((actions: Variety[]) => this._varieties.next(actions));
  }

  public getPlantCount(varieties: Variety[]): number {
    return varieties.length > 0 ? varieties.map((v: Variety) => v.plantsPerRow * v.rows).reduce((sum: number, count: number, idx: number) => sum + count) : 0;
  }

  getVariety(ids: string[]): Variety[] {
    return this._varieties.getValue().filter((v: Variety) => ids.indexOf(v.id) >= 0);
  }

  getVarietiesLabel(action: Action): string {
    return this.getVariety(action.variety).map((v: Variety) => v.name).join(', ');
  }


  getVintageVarietiesLabel(vintage: Vintage): string {
    return vintage.varieties
        .map((v: string) => this.getVarietyByID(v).name)
        .join(',');
  }
}
