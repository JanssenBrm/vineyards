import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import {VineyardDoc} from '../models/vineyarddoc.model';
import {BehaviorSubject} from 'rxjs';
import {Vintage} from '../models/vintage.model';
import {Note} from '../models/note.model';
import {Vineyard} from '../models/vineyard.model';
import {map} from 'rxjs/operators';
import {VINTAGE_COLLECTION} from './vintage.service';

export const  NOTE_COLLECTION = 'notes';
@Injectable({
  providedIn: 'root'
})
export class NotesService {

  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;
  private _notes: BehaviorSubject<Note[]>;


  constructor(private fireStore: AngularFirestore) {
    this._vineyardCollection = fireStore.collection<VineyardDoc>('vineyards');
    this._notes = new BehaviorSubject<Note[]>([]);
  }

  public getNotesListener(): BehaviorSubject<Note[]> {
    return this._notes;
  }

  public addNote(vineyard: Vineyard, vintage: Vintage, note: Note): void {
    this._vineyardCollection.doc(vineyard.id).collection<Vintage>(VINTAGE_COLLECTION).doc(vintage.id).collection<Note>(NOTE_COLLECTION).add(note);
  }

  public updateNote(vineyard: Vineyard, vintage: Vintage, note: Note): void {
    this._vineyardCollection.doc(vineyard.id).collection<Vintage>(VINTAGE_COLLECTION).doc(vintage.id).collection<Note>(NOTE_COLLECTION).doc(note.id).set(note);
  }

  public removeNote(vineyard: Vineyard, vintage: Vintage, note: Note): void {
    this._vineyardCollection.doc(vineyard.id).collection<Vintage>(VINTAGE_COLLECTION).doc(vintage.id).collection<Note>(NOTE_COLLECTION).doc(note.id).delete();
  }

  public getNotes(vineyard: Vineyard, vintage: Vintage): void {
    this._vineyardCollection.doc(vineyard.id).collection<Vintage>(VINTAGE_COLLECTION).doc(vintage.id).collection<Note>(NOTE_COLLECTION).snapshotChanges().pipe(
        map((data: DocumentChangeAction<Note>[]) => data.map((d: DocumentChangeAction<Note>) => (
            {
              ...d.payload.doc.data(),
              id: d.payload.doc.id,
            })))
    ).subscribe((notes: Note[]) => this._notes.next(notes));
  }
}
