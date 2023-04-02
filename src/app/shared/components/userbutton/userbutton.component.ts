import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { UtilService } from '../../../services/util.service';
import { BehaviorSubject } from 'rxjs';
import { UsermenuComponent } from '../usermenu/usermenu.component';
import firebase from "firebase/compat";

@Component({
  selector: 'app-userbutton',
  templateUrl: './userbutton.component.html',
  styleUrls: ['./userbutton.component.scss'],
})
export class UserbuttonComponent {
  public user: BehaviorSubject<firebase.User>;

  constructor(
    private authService: AuthService,
    private popoverController: PopoverController,
    public utilService: UtilService
  ) {
    this.user = this.authService.getUser();
  }

  async showUserMenu(event) {
    const popover = await this.popoverController.create({
      component: UsermenuComponent,
      event,
      showBackdrop: false,
      translucent: true,
    });
    return popover.present();
  }
}
