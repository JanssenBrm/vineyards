import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { VineyardDoc } from '../models/vineyarddoc.model';
import { BehaviorSubject } from 'rxjs';
import { Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import { User } from 'firebase';
import { AuthService } from './auth.service';
import { VineyardNote } from '../models/vineyardnote.model';

export const NOTE_COLLECTION = 'notes';
@Injectable({
  providedIn: 'root',
})
export class VineyardNotesService {
  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;

  private _notes: BehaviorSubject<VineyardNote[]>;

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {
    this._notes = new BehaviorSubject<VineyardNote[]>([]);
    this.authService.getUser().subscribe((user: User) => {
      if (user) {
        this._vineyardCollection = fireStore.collection<VineyardDoc>(`users/${user.uid}/vineyards`);
      }
    });
  }

  public getNotesListener(): BehaviorSubject<VineyardNote[]> {
    return this._notes;
  }

  public addNote(vineyard: Vineyard, note: VineyardNote): void {
    this._vineyardCollection.doc(vineyard.id).collection<VineyardNote>(NOTE_COLLECTION).add(note);
  }

  public updateNote(vineyard: Vineyard, note: VineyardNote): void {
    this._vineyardCollection.doc(vineyard.id).collection<VineyardNote>(NOTE_COLLECTION).doc(note.id).set(note);
  }

  public removeNote(vineyard: Vineyard, note: VineyardNote): void {
    this._vineyardCollection.doc(vineyard.id).collection<VineyardNote>(NOTE_COLLECTION).doc(note.id).delete();
  }

  public getNotes(vineyard: Vineyard): void {
    this._vineyardCollection
      .doc(vineyard.id)
      .collection<VineyardNote>(NOTE_COLLECTION)
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<VineyardNote>[]) =>
          data.map((d: DocumentChangeAction<VineyardNote>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        )
      )
      .subscribe((notes: VineyardNote[]) => this._notes.next(notes));
  }
}
