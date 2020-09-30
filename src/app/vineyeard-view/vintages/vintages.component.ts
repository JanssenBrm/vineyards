import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AddActionComponent} from '../add-action/add-action.component';
import {ModalController} from '@ionic/angular';
import {Vineyard} from '../../models/vineyard.model';
import {AddVintageComponent} from '../add-vintage/add-vintage.component';
import {Vintage} from '../../models/vintage.model';
import {VintageService} from '../../services/vintage.service';
import {BehaviorSubject} from 'rxjs';
import {VineyardService} from '../../services/vineyard.service';
import {Note} from '../../models/note.model';
import {NotesService} from '../../services/notes.service';
import {AddNoteComponent} from '../add-note/add-note.component';
import {VintageStage} from '../../models/stage.model';

@Component({
  selector: 'app-vintages',
  templateUrl: './vintages.component.html',
  styleUrls: ['./vintages.component.scss'],
})
export class VintagesComponent implements OnChanges {

  @Input()
  vineyard: Vineyard;

  vintage: Vintage;

  public vintages$: BehaviorSubject<Vintage[]> = null;
  public notes$: BehaviorSubject<Note[]> = null;

  STAGE = VintageStage;

  constructor(
      private modalController: ModalController,
      public vintageService: VintageService,
      public vineyardService: VineyardService,
      public notesService: NotesService
  ) {
    this.vintages$ = this.vintageService.getVintageListener();
    this.notes$ = this.notesService.getNotesListener();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this.vintageService.getVintages(this.vineyard);
    }
  }

  async openAddVintageModal() {
    const modal = await this.modalController.create({
      component: AddVintageComponent,
      componentProps: {
        vineyard: this.vineyard
      }
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.vintage) {
      this.parseVintage(data.data.vintage);
    }
  }

  private parseVintage(vintage: Vintage) {
    this.vintageService.addVintage(this.vineyard, vintage);
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

  setVintage(vintage: Vintage) {
    this.vintage = vintage;
    this.notesService.getNotes(this.vineyard, this.vintage);
  }

  deleteNote(note: Note) {
    this.notesService.removeNote(this.vineyard, this.vintage, note);
  }

  editNote(note: Note) {
    this.openAddNoteModal(note);
  }

}
