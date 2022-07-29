import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Vineyard } from '../../models/vineyard.model';
import { ModalController } from '@ionic/angular';
import { VineyardBaseNote, VineyardNote } from '../../models/vineyardnote.model';
import { VineyardNotesService } from '../../services/vineyardnotes.service';
import { BehaviorSubject } from 'rxjs';
import { AddNoteNotebookComponent } from '../add-note-notebook/add-note-notebook.component';

@Component({
  selector: 'app-notebook',
  templateUrl: './notebook.component.html',
  styleUrls: ['./notebook.component.scss'],
  encapsulation: ViewEncapsulation.None,
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

  async openAddNoteModal(note?: VineyardBaseNote) {
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

  deleteNote(note: VineyardBaseNote) {
    this.notesService.removeNote(this.vineyard, note);
  }

  editNote(note: VineyardBaseNote) {
    this.openAddNoteModal(note);
  }

  private parseNote(note: VineyardBaseNote) {
    note.id ? this.notesService.updateNote(this.vineyard, note) : this.notesService.addNote(this.vineyard, note);
  }

  setTagFilter(filter: string) {
    this.filter = `tag:${filter}`;
  }
}
