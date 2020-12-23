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
export class HeaderComponent implements OnInit, OnChanges {

  @Input()
  title: string;

  @Input()
  menuId: string;

  @Input()
  seasons: number[];

  @Input()
  activeSeasons: number[];

  @Input()
  showBackButton = true;

  @Input()
  showSeasons = true;

  @Output()
  setSeasons: EventEmitter<number[]> = new EventEmitter<number[]>();

  user: BehaviorSubject<User>;

  constructor(
      private menuController: MenuController,
      private authService: AuthService,
      private popoverController: PopoverController,
      public utilService: UtilService

  ) { }

  ngOnInit() {
    this.user = this.authService.getUser()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.seasons) {
      if (!this.activeSeasons && this.seasons && this.seasons.length > 0) {
          this.activeSeasons = [this.seasons[this.seasons.length - 1]];
      }
    }
  }

  async showUserMenu(event) {
      const popover = await this.popoverController.create({
        component: UsermenuComponent,
        event,
        showBackdrop: false,
        translucent: true
      });
      return await popover.present();
  }

  updateSeasons() {
    if (this.activeSeasons.length === 0) {
      this.activeSeasons = [this.seasons[this.seasons.length - 1]];
    }
    this.setSeasons.emit(this.activeSeasons);
  }

  async toggleMenu(id: string) {
      await this.menuController.open();
  }

}
