import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { VineyardDoc } from '../models/vineyarddoc.model';
import { BehaviorSubject } from 'rxjs';
import { Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import { User } from 'firebase';
import { AuthService } from './auth.service';
import { VineyardBaseNote, VineyardBaseNoteDoc, VineyardNote } from '../models/vineyardnote.model';
import { UtilService } from './util.service';
import * as moment from 'moment';

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

  public async addNote(vineyard: Vineyard, note: VineyardBaseNote): Promise<VineyardNote> {
    const doc = await this._vineyardCollection
      .doc(vineyard.id)
      .collection<VineyardBaseNoteDoc>(NOTE_COLLECTION)
      .add(this.convertToDoc(note));
    return {
      ...note,
      id: doc.id,
      html: UtilService.parseMarkdown(note.description),
    };
  }

  public async updateNote(vineyard: Vineyard, note: VineyardBaseNote): Promise<VineyardNote> {
    await this._vineyardCollection
      .doc(vineyard.id)
      .collection<VineyardBaseNoteDoc>(NOTE_COLLECTION)
      .doc(note.id)
      .set(this.convertToDoc(note));
    return {
      ...note,
      html: UtilService.parseMarkdown(note.description),
    };
  }

  private convertToDoc(note: VineyardBaseNote): VineyardBaseNoteDoc {
    return {
      ...note,
      date: note.date.toISOString(),
    };
  }

  public async removeNote(vineyard: Vineyard, note: VineyardBaseNote): Promise<void> {
    await this._vineyardCollection
      .doc(vineyard.id)
      .collection<VineyardBaseNoteDoc>(NOTE_COLLECTION)
      .doc(note.id)
      .delete();
  }

  public getNotes(vineyard: Vineyard): void {
    this._vineyardCollection
      .doc(vineyard.id)
      .collection<VineyardBaseNoteDoc>(NOTE_COLLECTION)
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<VineyardBaseNoteDoc>[]) =>
          data.map((d: DocumentChangeAction<VineyardBaseNoteDoc>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        ),
        map((notes: VineyardBaseNoteDoc[]) =>
          notes.map((n: VineyardBaseNoteDoc) => ({
            ...n,
            html: UtilService.parseMarkdown(n.description),
            date: moment(n.date),
          }))
        )
      )
      .subscribe((notes: VineyardNote[]) => this._notes.next(notes));
  }
}
