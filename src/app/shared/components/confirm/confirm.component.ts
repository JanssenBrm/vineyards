import {Component, Input, OnInit} from '@angular/core';
import {ActionType} from '../../../models/action.model';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})
export class ConfirmComponent implements OnInit {

  @Input()
  message: string;

  constructor(
      private modalController: ModalController
  ) { }

  ngOnInit() {}

  close(confirm: boolean) {
    this.modalController.dismiss({
      confirm});
  }


}
