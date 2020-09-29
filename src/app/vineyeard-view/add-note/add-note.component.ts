import { Component, OnInit } from '@angular/core';
import {VintageStage} from '../../models/stage.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss'],
})
export class AddNoteComponent implements OnInit {

  public VINTAGE_STAGES = VintageStage;
  public STAGES = Object.keys(VintageStage);

  public noteForm: FormGroup;

  constructor(
      private modalController: ModalController
  ) { }

  ngOnInit() {
    this.noteForm = new FormGroup({
      date: new FormControl('', [Validators.required]),
      stage: new FormControl(''),
      description: new FormControl('', [Validators.required]),
    });
  }

  save() {
    this.modalController.dismiss({
      note: {
        ...this.noteForm.value,
        date: this.noteForm.value.date.split('T')[0],
      }});
  }

  discard() {
    this.modalController.dismiss({
      note: undefined
    });
  }

}
