import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Note} from '../../models/note.model';
import {NotesService} from '../../services/notes.service';
import {Vineyard} from '../../models/vineyard.model';
import {Vintage} from '../../models/vintage.model';
import {AddNoteComponent} from '../add-note/add-note.component';
import {ModalController} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';
import {VintageStage} from '../../models/stage.model';

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

  public notes$: BehaviorSubject<Note[]> = null;
  public  STAGE = VintageStage;

  constructor(
      private notesService: NotesService,
      private modalController: ModalController
  ) { }

  ngOnInit() {
    this.notes$ = this.notesService.getNotesListener();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.notesService.getNotes(this.vineyard, this.vintage);
  }

  async openAddNoteModal(note?: Note) {
    const modal = await this.modalController.create({
      component: AddNoteComponent,
      componentProps: {
        vineyard: this.vineyard,
        vintage: this.vintage,
        note
      }
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.note) {
      this.parseNote(data.data.note);
    }
  }

  private parseNote(note: Note) {
    note.id ?  this.notesService.updateNote(this.vineyard, this.vintage, note) : this.notesService.addNote(this.vineyard, this.vintage, note);
  }

  deleteNote(note: Note) {
    this.notesService.removeNote(this.vineyard, this.vintage, note);
  }

  editNote(note: Note) {
    this.openAddNoteModal(note);
  }

}
