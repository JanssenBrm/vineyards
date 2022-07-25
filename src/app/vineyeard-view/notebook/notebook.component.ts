import { Component, Input, OnInit } from '@angular/core';
import { Vineyard } from '../../models/vineyard.model';
import { ModalController } from '@ionic/angular';
import { VineyardNote } from '../../models/vineyardnote.model';
import { VineyardNotesService } from '../../services/vineyardnotes.service';
import { BehaviorSubject } from 'rxjs';
import { AddNoteNotebookComponent } from '../add-note-notebook/add-note-notebook.component';

@Component({
  selector: 'app-notebook',
  templateUrl: './notebook.component.html',
  styleUrls: ['./notebook.component.scss'],
})
export class NotebookComponent implements OnInit {
  @Input()
  vineyard: Vineyard;

  public notes$: BehaviorSubject<VineyardNote[]> = null;

  public filter: string = '';

  constructor(private modalController: ModalController, private notesService: VineyardNotesService) {}

  ngOnInit() {
    this.notes$ = this.notesService.getNotesListener();
  }

  async openAddNoteModal(note?: VineyardNote) {
    const modal = await this.modalController.create({
      component: AddNoteNotebookComponent,
      componentProps: {
        note,
      },
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.note) {
      this.parseNote(data.data.note);
    }
  }

  deleteNote(note: VineyardNote) {
    this.notesService.removeNote(this.vineyard, note);
  }

  editNote(note: VineyardNote) {
    this.openAddNoteModal(note);
  }

  private parseNote(note: VineyardNote) {
    note.id ? this.notesService.updateNote(this.vineyard, note) : this.notesService.addNote(this.vineyard, note);
  }

  setTagFilter(filter: string) {
    this.filter = `tag:${filter}`;
  }
}
