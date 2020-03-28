import { BBCH_STAGES } from './../../conf/bbch.config';
import { ActionType } from 'src/app/models/action.model';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BBCH } from 'src/app/models/bbch.model';

@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss'],
})
export class AddActionComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  public actionForm: FormGroup;
  public actionTypes: string[];
  public bbchCodes: BBCH[];

  ngOnInit() {
    this.actionTypes = Object.keys(ActionType);
    this.bbchCodes = BBCH_STAGES;
    this.actionForm = new FormGroup({
      type: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      bbch: new FormControl(''),
      variety: new FormControl(''),
      rows: new FormControl(''),
      plantsPerRow: new FormControl(''),
    });

    this.actionForm.get('type').valueChanges.subscribe((type: string) => {
      if (type === 'BBCH') {
        this.actionForm.get('bbch').setValidators([Validators.required]);
      } else if (type === 'Planting') {
        this.actionForm.get('variety').setValidators([Validators.required]);
        this.actionForm.get('rows').setValidators([Validators.required]);
        this.actionForm.get('plantsPerRow').setValidators([Validators.required]);
      } else {
        this.actionForm.get('bbch').setValidators(null);
        this.actionForm.get('variety').setValidators(null);
        this.actionForm.get('rows').setValidators(null);
        this.actionForm.get('plantsPerRow').setValidators(null);
      }
    });
  }

  save() {
    this.modalController.dismiss({
      action: {
        ...this.actionForm.value,
        date: this.actionForm.value.date.split('T')[0],
        type: ActionType[this.actionForm.value.type]
    }});
  }

  discard() {
    this.modalController.dismiss({
      action: undefined
    });
  }

}
