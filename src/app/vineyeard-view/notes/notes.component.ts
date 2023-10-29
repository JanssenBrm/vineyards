import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NoteBase } from '../../models/note.model';
import { NotesService } from '../../services/notes.service';
import { Vineyard, VineyardPermissions } from '../../models/vineyard.model';
import { Vintage } from '../../models/vintage.model';
import { AddNoteComponent } from '../add-note/add-note.component';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { VintageEvent } from '../../models/vintageevent.model';
import { VintageService } from '../../services/vintage.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit, OnChanges {
  @Input()
  vineyard: Vineyard;

  @Input()
  vintage: Vintage;

  public notes$: BehaviorSubject<NoteBase[]> = null;

  public STAGE = VintageEvent;

  public activeTypes: string[] = Object.keys(VintageEvent);

  constructor(
    private notesService: NotesService,
    private modalController: ModalController,
    public vintageService: VintageService
  ) {}

  ngOnInit() {
    this.notes$ = this.notesService.getNotesListener();
  }

  ngOnChanges() {
    this.notesService.getNotes(this.vineyard, this.vintage);
  }

  async openAddNoteModal(note?: NoteBase) {
    const modal = await this.modalController.create({
      component: AddNoteComponent,
      componentProps: {
        vineyard: this.vineyard,
        vintage: this.vintage,
        note,
      },
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.note) {
      this.parseNote(data.data.note);
    }
  }

  private parseNote(note: NoteBase) {
    note.id
      ? this.notesService.updateNote(this.vineyard, this.vintage, note)
      : this.notesService.addNote(this.vineyard, this.vintage, note);
  }

  deleteNote(note: NoteBase) {
    this.notesService.removeNote(this.vineyard, this.vintage, note);
  }

  editNote(note: NoteBase) {
    this.openAddNoteModal(note);
  }

  toggleNoteType(stage: string) {
    if (this.activeTypes.find((s) => s === stage)) {
      this.activeTypes = this.activeTypes.filter((s) => s !== stage);
    } else {
      this.activeTypes = [...this.activeTypes, stage];
    }
  }

  public readonly VineyardPermissions = VineyardPermissions;
}
