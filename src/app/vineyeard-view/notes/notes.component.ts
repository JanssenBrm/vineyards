import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Note} from '../../models/note.model';
import {NotesService} from '../../services/notes.service';
import {Vineyard} from '../../models/vineyard.model';
import {Vintage} from '../../models/vintage.model';
import {AddNoteComponent} from '../add-note/add-note.component';
import {ModalController} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs';
import {VintageEvent, VINTAGEEVENT_COLORS} from '../../models/vintageevent.model';

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
  public  STAGE = VintageEvent;

  public activeTypes: string[] = Object.keys(VintageEvent);

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

  getEventTypeColor(stage: string): string {
    const idx = Object.keys(this.STAGE).findIndex((s: string) => s === stage);
    if (idx >= 0 && this.activeTypes.find(s => s === stage)) {
      return VINTAGEEVENT_COLORS[idx];
    } else {
      return 'lightgrey';
    }
  }

  toggleNoteType(stage: string) {
    if (this.activeTypes.find(s => s === stage)) {
      this.activeTypes = this.activeTypes.filter(s => s !== stage);
    } else {
      this.activeTypes = [...this.activeTypes, stage];
    }
  }

}
