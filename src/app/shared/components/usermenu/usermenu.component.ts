import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.scss'],
})
export class UsermenuComponent implements OnInit {

  constructor(
      private popoverController: PopoverController,
      private authService: AuthService
  ) { }

  ngOnInit() {}

  async logOut() {
    await this.authService.logout();
    await this.dismissPopover();
  }

  async dismissPopover() {
    await this.popoverController.dismiss();
  }

}
