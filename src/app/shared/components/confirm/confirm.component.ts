import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})
export class ConfirmComponent {
  @Input()
  message: string;

  constructor(private modalController: ModalController) {}

  close(confirm: boolean) {
    this.modalController.dismiss({
      confirm,
    });
  }
}
