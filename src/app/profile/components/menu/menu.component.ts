import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

export enum MenuTab {
  INFO = 'info',
  ORDERS = 'orders',
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, AfterViewInit {
  public activePage: string;

  MenuTab = MenuTab;

  @Output()
  tabUpdated: EventEmitter<MenuTab> = new EventEmitter<MenuTab>();

  constructor(private location: Location, private activeRoute: ActivatedRoute) {}

  ngAfterViewInit() {
    this.openTab(this.activeRoute.snapshot.params.tab || MenuTab.INFO);
  }

  ngOnInit() {
    const path = this.location.path().split('/');
    this.activePage = path[path.length - 1];
  }

  openTab(tab: MenuTab): void {
    this.activePage = tab;
    this.tabUpdated.emit(tab);
  }

  goBack() {
    this.location.back();
  }
}
