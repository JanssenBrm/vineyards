import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { VineyardDoc } from '../models/vineyarddoc.model';
import { BehaviorSubject } from 'rxjs';
import { Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import firebase from "firebase/compat";
import { VineyardBaseNote, VineyardNote } from '../models/vineyardnote.model';
import { UtilService } from './util.service';

export const NOTE_COLLECTION = 'notes';
@Injectable({
  providedIn: 'root',
})
export class VineyardNotesService {
  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;

  private _notes: BehaviorSubject<VineyardNote[]>;

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {
    this._notes = new BehaviorSubject<VineyardNote[]>([]);
    this.authService.getUser().subscribe((user: firebase.User) => {
      if (user) {
        this._vineyardCollection = fireStore.collection<VineyardDoc>(`users/${user.uid}/vineyards`);
      }
    });
  }

  public getNotesListener(): BehaviorSubject<VineyardNote[]> {
    return this._notes;
  }

  public async addNote(vineyard: Vineyard, note: VineyardBaseNote): Promise<VineyardNote> {
    const doc = await this._vineyardCollection.doc(vineyard.id).collection<VineyardBaseNote>(NOTE_COLLECTION).add(note);
    return {
      ...note,
      id: doc.id,
      html: UtilService.parseMarkdown(note.description),
    };
  }

  public async updateNote(vineyard: Vineyard, note: VineyardBaseNote): Promise<VineyardNote> {
    await this._vineyardCollection
      .doc(vineyard.id)
      .collection<VineyardBaseNote>(NOTE_COLLECTION)
      .doc(note.id)
      .set(note);
    return {
      ...note,
      html: UtilService.parseMarkdown(note.description),
    };
  }

  public async removeNote(vineyard: Vineyard, note: VineyardBaseNote): Promise<void> {
    await this._vineyardCollection.doc(vineyard.id).collection<VineyardBaseNote>(NOTE_COLLECTION).doc(note.id).delete();
  }

  public getNotes(vineyard: Vineyard): void {
    this._vineyardCollection
      .doc(vineyard.id)
      .collection<VineyardBaseNote>(NOTE_COLLECTION)
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<VineyardBaseNote>[]) =>
          data.map((d: DocumentChangeAction<VineyardBaseNote>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        ),
        map((notes: VineyardBaseNote[]) =>
          notes.map((n: VineyardNote) => ({
            ...n,
            html: UtilService.parseMarkdown(n.description),
          }))
        )
      )
      .subscribe((notes: VineyardNote[]) => this._notes.next(notes));
  }
}
