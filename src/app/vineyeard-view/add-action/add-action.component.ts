import { ActionType } from 'src/app/models/action.model';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss'],
})
export class AddActionComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  public actionForm: FormGroup;
  public actionTypes: string[];

  ngOnInit() {
    this.actionTypes = Object.keys(ActionType);
    this.actionForm = new FormGroup({
      type: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      description: new FormControl('')
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
