import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Vineyard} from '../../models/vineyard.model';
import {ActionType} from '../../models/action.model';
import {ModalController} from '@ionic/angular';
import * as moment from 'moment';
import {Vintage} from '../../models/vintage.model';
import {VintageColor} from '../../models/vintagecolor.model';

@Component({
  selector: 'app-add-vintage',
  templateUrl: './add-vintage.component.html',
  styleUrls: ['./add-vintage.component.scss'],
})
export class AddVintageComponent implements OnInit {

  @Input()
  vineyard: Vineyard;

  @Input()
  vintage: Vintage;

  public vintageForm: FormGroup;
  public colors: string[];

  constructor(
      private modalController: ModalController
  ) { }

  ngOnInit() {
    this.colors = Object.keys(VintageColor);
    if (this.vintage) {
      this.vintageForm = new FormGroup({
        year: new FormControl(`${this.vintage.year}-01-01'`, [Validators.required]),
        name: new FormControl(this.vintage.name, [Validators.required]),
        color: new FormControl(this.vintage.color, [Validators.required]),
        varieties: new FormControl(this.vintage.varieties, [Validators.required]),
      });
    } else {
      this.vintageForm = new FormGroup({
        year: new FormControl('', [Validators.required]),
        name: new FormControl('', [Validators.required]),
        color: new FormControl('', [Validators.required]),
        varieties: new FormControl([], [Validators.required]),
      });
    }

  }

  save() {
    this.modalController.dismiss({
      vintage: {
        id: this.vintage ? this.vintage.id : '',
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
