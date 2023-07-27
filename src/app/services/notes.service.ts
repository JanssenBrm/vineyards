import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { VineyardDoc } from '../models/vineyarddoc.model';
import { BehaviorSubject } from 'rxjs';
import { Vintage } from '../models/vintage.model';
import { Note, NoteBase, NoteBaseDoc } from '../models/note.model';
import { Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import { VINTAGE_COLLECTION } from './vintage.service';
import { User } from 'firebase';
import { AuthService } from './auth.service';
import { UtilService } from './util.service';
import * as moment from 'moment';

export const NOTE_COLLECTION = 'notes';
@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;

  private _notes: BehaviorSubject<Note[]>;

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {
    this._notes = new BehaviorSubject<Note[]>([]);
    this.authService.getUser().subscribe((user: User) => {
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
      .collection<NoteBaseDoc>(NOTE_COLLECTION)
      .add(this.convertToDoc(note));

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
      .collection<NoteBaseDoc>(NOTE_COLLECTION)
      .doc(note.id)
      .set(this.convertToDoc(note));

    return {
      ...note,
      html: UtilService.parseMarkdown(note.description),
    };
  }

  private convertToDoc(note: NoteBase): NoteBaseDoc {
    return {
      ...note,
      date: note.date.toISOString(),
    };
  }

  public async removeNote(vineyard: Vineyard, vintage: Vintage, note: NoteBase): Promise<void> {
    await this._vineyardCollection
      .doc(vineyard.id)
      .collection<Vintage>(VINTAGE_COLLECTION)
      .doc(vintage.id)
      .collection<NoteBaseDoc>(NOTE_COLLECTION)
      .doc(note.id)
      .delete();
  }

  public getNotes(vineyard: Vineyard, vintage: Vintage): void {
    this._vineyardCollection
      .doc(vineyard.id)
      .collection<Vintage>(VINTAGE_COLLECTION)
      .doc(vintage.id)
      .collection<NoteBaseDoc>(NOTE_COLLECTION)
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<NoteBaseDoc>[]) =>
          data.map((d: DocumentChangeAction<NoteBaseDoc>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        ),
        map((notes: NoteBaseDoc[]) =>
          notes.map((n: NoteBaseDoc) => ({
            ...n,
            html: UtilService.parseMarkdown(n.description),
            date: moment(n.date),
          }))
        )
      )
      .subscribe((notes: Note[]) => this._notes.next(notes));
  }
}
