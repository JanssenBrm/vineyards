import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Vintage } from '../models/vintage.model';
import { Note, NoteBase, NoteBaseDoc } from '../models/note.model';
import { Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import { UtilService } from './util.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private _notes: BehaviorSubject<Note[]>;

  constructor(private fireStore: AngularFirestore) {
    this._notes = new BehaviorSubject<Note[]>([]);
  }

  public getNotesListener(): BehaviorSubject<Note[]> {
    return this._notes;
  }

  private getVinetageNotesCollectionPath(vineyard: Vineyard, vinetage: Vintage): string {
    return `users/${vineyard.owner}/vineyards/${vineyard.id}/vintages/${vinetage.id}/notes`;
  }

  public async addNote(vineyard: Vineyard, vintage: Vintage, note: NoteBase): Promise<Note> {
    const doc = await this.fireStore
      .collection<NoteBaseDoc>(this.getVinetageNotesCollectionPath(vineyard, vintage))
      .add(this.convertToDoc(note));

    return {
      ...note,
      id: doc.id,
      html: UtilService.parseMarkdown(note.description),
    };
  }

  public async updateNote(vineyard: Vineyard, vintage: Vintage, note: NoteBase): Promise<Note> {
    await this.fireStore
      .collection<NoteBaseDoc>(this.getVinetageNotesCollectionPath(vineyard, vintage))
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
    await this.fireStore
      .collection<NoteBaseDoc>(this.getVinetageNotesCollectionPath(vineyard, vintage))
      .doc(note.id)
      .delete();
  }

  public getNotes(vineyard: Vineyard, vintage: Vintage): void {
    this.fireStore
      .collection<NoteBaseDoc>(this.getVinetageNotesCollectionPath(vineyard, vintage))
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
