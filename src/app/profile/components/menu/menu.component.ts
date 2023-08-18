import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';

export enum MenuTab {
  INFO = 'info',
  ORDERS = 'orders',
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public activePage: string;

  MenuTab = MenuTab;

  @Output()
  tabUpdated: EventEmitter<MenuTab> = new EventEmitter<MenuTab>();

  constructor(private location: Location) {}

  ngOnInit() {
    const path = this.location.path().split('/');
    this.activePage = path[path.length - 1];
  }

  openTab(tab: MenuTab): void {
    this.activePage = tab;
    this.tabUpdated.emit(tab);
  }
}
