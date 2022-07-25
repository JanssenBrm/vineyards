import { Component, Input } from '@angular/core';
import { MenuController } from '@ionic/angular';

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

  constructor(private menuController: MenuController) {}

  async toggleMenu() {
    await this.menuController.open();
  }
}
