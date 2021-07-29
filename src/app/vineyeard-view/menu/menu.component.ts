import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SeasonsService} from '../../services/seasons.service';
import {NavController} from '@ionic/angular';
import {Vineyard} from '../../models/vineyard.model';
import {Location} from '@angular/common';
import {Vintage} from '../../models/vintage.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  @Input()
  seasons: number[];

  @Input()
  activeSeasons: number[];

  @Input()
  activeVineyard: Vineyard;

  @Input()
  activeVintage: Vintage;

  @Input()
  vintages: Vintage[];

  @Output()
  seasonsUpdated: EventEmitter<number[]> = new EventEmitter<number[]>();

  @Output()
  tabUpdated: EventEmitter<'info' | 'actions' | 'stats' | 'vintages'> = new EventEmitter<'info' | 'actions' | 'stats' | 'vintages'>();

  @Output()
  openVintage: EventEmitter<Vintage> = new EventEmitter<Vintage>();

  public activePage: string;
  public activeSubMenus: string[] = [];

  constructor(
      private seasonService: SeasonsService,
      private navController: NavController,
      private location: Location,
  ) { }

  ngOnInit() {
    const path = this.location.path().split('/');
    this.activePage = path[path.length - 1];
    console.log(this.activePage);
  }

  setSeasons(years: number[]): void {
    this.seasonService.setActiveSeasons(years);
    this.seasonsUpdated.emit(years);
  }

  openOverview() {
    this.navController.navigateBack('/');
  }

  openTab(tab: 'info' | 'actions' | 'stats' | 'vintages'): void {
    this.activePage = tab;
    this.activeVintage = undefined;
    this.tabUpdated.emit(tab);
  }

  toggleSubmenu(menu: string) {
    if (this.activeSubMenus.includes(menu)) {
      this.activeSubMenus = this.activeSubMenus.filter((m: string) => m !== menu);
    } else {
      this.activeSubMenus.push(menu);
    }
  }

  viewVintage(vintage: Vintage) {
    this.activeVintage = vintage;
    this.activePage = undefined;
    this.openVintage.emit(vintage);
  }



}
