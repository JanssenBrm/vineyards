import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import {Vineyard} from '../models/vineyard.model';
import {Vintage} from '../models/vintage.model';
import {VineyardDoc} from '../models/vineyarddoc.model';
import {map, switchMap, tap} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {Action} from '../models/action.model';
import {Note} from '../models/note.model';
import {NOTE_COLLECTION} from './notes.service';

export const VINTAGE_COLLECTION = 'vintages';

@Injectable({
  providedIn: 'root'
})
export class VintageService {

  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;
  private _vintages: BehaviorSubject<Vintage[]>;

  constructor(private fireStore: AngularFirestore) {
    this._vineyardCollection = fireStore.collection<VineyardDoc>('vineyards');
    this._vintages = new BehaviorSubject<Vintage[]>([]);
  }

  public getVintageListener(): BehaviorSubject<Vintage[]> {
    return this._vintages;
  }

  public addVintage(vineyard: Vineyard, vintage: Vintage): void {
    this._vineyardCollection.doc(vineyard.id).collection<Vintage>(VINTAGE_COLLECTION).add(vintage);
  }

  public updateVintage(vineyard: Vineyard, vintage: Vintage): void {
    this._vineyardCollection.doc(vineyard.id).collection<Vintage>(VINTAGE_COLLECTION).doc(vintage.id).set(vintage);
  }

  public removeVintage(vineyard: Vineyard, vintage: Vintage): void {
    this._vineyardCollection.doc(vineyard.id).collection<Vintage>(VINTAGE_COLLECTION).doc(vintage.id).delete();
  }

  public getVintages(vineyard: Vineyard): void {
    this._vineyardCollection.doc(vineyard.id).collection<Vintage>(VINTAGE_COLLECTION).snapshotChanges().pipe(
        map((data: DocumentChangeAction<Vintage>[]) => data.map((d: DocumentChangeAction<Vintage>) => (
            {
              ...d.payload.doc.data(),
              id: d.payload.doc.id,
            })))
    ).subscribe((vintages: Vintage[]) => this._vintages.next(vintages));
  }
}
