import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { VineyardDoc } from '../models/vineyarddoc.model';
import { BehaviorSubject } from 'rxjs';
import { Vintage } from '../models/vintage.model';
import { Note, NoteBase } from '../models/note.model';
import { Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import { VINTAGE_COLLECTION } from './vintage.service';
import firebase from "firebase/compat";
import { AuthService } from './auth.service';
import { UtilService } from './util.service';

export const NOTE_COLLECTION = 'notes';
@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;

  private _notes: BehaviorSubject<Note[]>;

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {
    this._notes = new BehaviorSubject<Note[]>([]);
    this.authService.getUser().subscribe((user: firebase.User) => {
      if (user) {
        this._vineyardCollection = fireStore.collection<VineyardDoc>(`users/${user.uid}/vineyards`);
      }
    });
  }

  public getNotesListener(): BehaviorSubject<Note[]> {
    return this._notes;
  }

  public async addNote(vineyard: Vineyard, vintage: Vintage, note: NoteBase): Promise<Note> {
    const doc = await this._vineyardCollection
      .doc(vineyard.id)
      .collection<Vintage>(VINTAGE_COLLECTION)
      .doc(vintage.id)
      .collection<NoteBase>(NOTE_COLLECTION)
      .add(note);

    return {
      ...note,
      id: doc.id,
      html: UtilService.parseMarkdown(note.description),
    };
  }

  public async updateNote(vineyard: Vineyard, vintage: Vintage, note: NoteBase): Promise<Note> {
    await this._vineyardCollection
      .doc(vineyard.id)
      .collection<Vintage>(VINTAGE_COLLECTION)
      .doc(vintage.id)
      .collection<NoteBase>(NOTE_COLLECTION)
      .doc(note.id)
      .set(note);

    return {
      ...note,
      html: UtilService.parseMarkdown(note.description),
    };
  }

  public async removeNote(vineyard: Vineyard, vintage: Vintage, note: NoteBase): Promise<void> {
    await this._vineyardCollection
      .doc(vineyard.id)
      .collection<Vintage>(VINTAGE_COLLECTION)
      .doc(vintage.id)
      .collection<NoteBase>(NOTE_COLLECTION)
      .doc(note.id)
      .delete();
  }

  public getNotes(vineyard: Vineyard, vintage: Vintage): void {
    this._vineyardCollection
      .doc(vineyard.id)
      .collection<Vintage>(VINTAGE_COLLECTION)
      .doc(vintage.id)
      .collection<NoteBase>(NOTE_COLLECTION)
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<NoteBase>[]) =>
          data.map((d: DocumentChangeAction<NoteBase>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        ),
        map((notes: NoteBase[]) =>
          notes.map((n: NoteBase) => ({
            ...n,
            html: UtilService.parseMarkdown(n.description),
          }))
        )
      )
      .subscribe((notes: Note[]) => this._notes.next(notes));
  }
}
