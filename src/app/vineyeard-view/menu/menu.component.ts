import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SeasonsService } from '../../services/seasons.service';
import { ModalController, NavController } from '@ionic/angular';
import { Vineyard } from '../../models/vineyard.model';
import { Location } from '@angular/common';
import { Vintage } from '../../models/vintage.model';
import { AddVintageComponent } from '../add-vintage/add-vintage.component';
import { VintageService } from '../../services/vintage.service';
import { VarietyService } from '../../services/variety.service';

export enum MenuTab {
  INFO = 'info',
  ACTIONS = 'actions',
  STATS = 'stats',
  VINTAGES = 'vintages',
  NOTES = 'notes',
}

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
  tabUpdated: EventEmitter<MenuTab> = new EventEmitter<MenuTab>();

  @Output()
  openVintage: EventEmitter<Vintage> = new EventEmitter<Vintage>();

  public activePage: string;

  public activeSubMenus: string[] = [];

  MenuTab = MenuTab;

  constructor(
    private seasonService: SeasonsService,
    private navController: NavController,
    private location: Location,
    private modalController: ModalController,
    public vintageService: VintageService,
    public varietyService: VarietyService
  ) {}

  ngOnInit() {
    const path = this.location.path().split('/');
    this.activePage = path[path.length - 1];
  }

  setSeasons(years: number[]): void {
    this.seasonService.setActiveSeasons(years);
    this.seasonsUpdated.emit(years);
  }

  openOverview() {
    this.navController.navigateBack('/');
  }

  openTab(tab: MenuTab): void {
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

  async openAddVintageModal() {
    const modal = await this.modalController.create({
      component: AddVintageComponent,
      componentProps: {
        vineyard: this.activeVineyard,
      },
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.vintage) {
      this.parseVintage(data.data.vintage);
    }
  }

  private parseVintage(vintage: Vintage) {
    this.vintageService.addVintage(this.activeVineyard, vintage);
  }

  viewVintage(vintage: Vintage) {
    this.activeVintage = vintage;
    this.activePage = undefined;
    this.openVintage.emit(vintage);
  }
}
