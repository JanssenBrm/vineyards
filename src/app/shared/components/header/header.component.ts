import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Season } from 'src/app/models/season.model';
import {MenuController, PopoverController} from '@ionic/angular';
import {AuthService} from '../../../services/auth.service';
import {BehaviorSubject} from 'rxjs';
import {User} from 'firebase';
import {UsermenuComponent} from '../usermenu/usermenu.component';
import {UtilService} from '../../../services/util.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  @Input()
  title: string;

  @Input()
  menuId: string;

  @Input()
  showBackButton = true;


  constructor(
      private menuController: MenuController,
  ) { }

  async toggleMenu(id: string) {
      await this.menuController.open();
  }

}
