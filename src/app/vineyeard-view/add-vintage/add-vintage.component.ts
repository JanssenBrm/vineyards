import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Vineyard} from '../../models/vineyard.model';
import {ActionType} from '../../models/action.model';
import {ModalController} from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-add-vintage',
  templateUrl: './add-vintage.component.html',
  styleUrls: ['./add-vintage.component.scss'],
})
export class AddVintageComponent implements OnInit {

  @Input()
  vineyard: Vineyard;;

  public vintageForm: FormGroup;

  constructor(
      private modalController: ModalController
  ) { }

  ngOnInit() {
    this.vintageForm = new FormGroup({
      year: new FormControl('', [Validators.required]),
      name: new FormControl(''),
      varietyId: new FormControl([]),
    });

  }

  save() {
    this.modalController.dismiss({
      vintage: {
        ...this.vintageForm.value,
        year: moment(this.vintageForm.value.year).year(),
      }});
  }

  discard() {
    this.modalController.dismiss({
      vintage: undefined
    });
  }



}
