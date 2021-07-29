import {Component, Input, OnInit} from '@angular/core';
import {User} from 'firebase';
import {MenuController, PopoverController} from '@ionic/angular';
import {AuthService} from '../../../services/auth.service';
import {UtilService} from '../../../services/util.service';
import {BehaviorSubject} from 'rxjs';
import {UsermenuComponent} from '../usermenu/usermenu.component';

@Component({
  selector: 'app-userbutton',
  templateUrl: './userbutton.component.html',
  styleUrls: ['./userbutton.component.scss'],
})
export class UserbuttonComponent implements OnInit {

  public user: BehaviorSubject<User>;

  constructor(
      private authService: AuthService,
      private popoverController: PopoverController,
      public utilService: UtilService
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {}

  async showUserMenu(event) {
    const popover = await this.popoverController.create({
      component: UsermenuComponent,
      event,
      showBackdrop: false,
      translucent: true
    });
    return await popover.present();
  }

}
