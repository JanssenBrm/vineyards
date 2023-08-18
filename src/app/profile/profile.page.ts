import { Component } from '@angular/core';
import { MenuTab } from './components/menu/menu.component';
import { MenuController, Platform } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  public activePage: MenuTab;

  constructor(private location: Location, private platform: Platform, private menuController: MenuController) {
    this.activePage = MenuTab.INFO;
  }

  openTab(tab: MenuTab): void {
    if (tab !== this.activePage) {
      this.activePage = tab;
      this.location.go(`/profile/${tab}`);
    }
    this.closeMenu();
  }

  closeMenu(): void {
    if (this.isMobile()) {
      this.menuController.close();
    }
  }

  isMobile(): boolean {
    return ['mobile'].filter((p: string) => this.platform.platforms().includes(p)).length > 0;
  }

  public readonly MenuTab = MenuTab;
}
