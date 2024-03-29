import { MenuController, ModalController, NavController, Platform } from '@ionic/angular';
import { Vineyard, VineyardPermissions } from './../models/vineyard.model';
import { VineyardService } from './../services/vineyard.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { VintageService } from '../services/vintage.service';
import { Vintage } from '../models/vintage.model';
import { VarietyService } from '../services/variety.service';
import { Action } from '../models/action.model';
import { ActionService } from '../services/action.service';
import { SeasonsService } from '../services/seasons.service';
import { Variety } from '../models/variety.model';
import { AddVintageComponent } from './add-vintage/add-vintage.component';
import { VineyardNotesService } from '../services/vineyardnotes.service';
import { StatisticsService } from '../services/statistics.service';
import { IntegrationsService } from '../services/integrations.service';
import { Integration } from '../models/integration.model';
import { MenuTab } from './menu/menu.component';

@Component({
  selector: 'app-vineyeard-view',
  templateUrl: './vineyard-view-page.component.html',
  styleUrls: ['./vineyard-view-page.component.scss'],
})
export class VineyardViewPage implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    public vineyardService: VineyardService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private platform: Platform,
    private menuController: MenuController,
    private navController: NavController,
    public vintageService: VintageService,
    private varietyService: VarietyService,
    private actionService: ActionService,
    private seasonService: SeasonsService,
    private modalController: ModalController,
    private noteService: VineyardNotesService,
    private statService: StatisticsService,
    private integrationsService: IntegrationsService
  ) {}

  public seasons$: BehaviorSubject<number[]>;

  public activeSeasons$: BehaviorSubject<number[]>;

  public activeSeasons: number[];

  public activeVineyard: Vineyard;

  private _destroy: Subject<boolean>;

  public vintages$: BehaviorSubject<Vintage[]> = null;

  public activePage: MenuTab;

  public activeVintage: Vintage;

  public activeSubMenus: string[] = [];

  public actions$: BehaviorSubject<Action[]>;

  public varieties$: BehaviorSubject<Variety[]>;

  public integrations$: BehaviorSubject<Integration[]>;

  ngOnInit() {
    this._destroy = new Subject<boolean>();
    this.vintages$ = this.vintageService.getVintageListener();
    this.actions$ = this.actionService.getActionListener();
    this.seasons$ = this.seasonService.getSeasonListener();
    this.activeSeasons$ = this.seasonService.getActiveSeasonListener();
    this.varieties$ = this.varietyService.getVarietyListener();
    this.integrations$ = this.integrationsService.getIntegrationListener();

    this.activePage = MenuTab.INFO;
  }

  ngAfterViewInit() {
    this.activePage = this.activeRoute.snapshot.params.tab;

    this.vineyardService
      .getVineyardsListener()
      .pipe(takeUntil(this._destroy))
      .subscribe((vineyards: Vineyard[]) => {
        this.activeVineyard = vineyards.find((v: Vineyard) => v.id === this.activeRoute.snapshot.params.id);
        if (this.activeVineyard) {
          this.varietyService.getVarieties(this.activeVineyard);
          this.vintageService.getVintages(this.activeVineyard);
          this.actionService.getActions(this.activeVineyard);
          this.varietyService.getVarieties(this.activeVineyard);
          this.noteService.getNotes(this.activeVineyard);
          this.statService.getMeteoStats(this.activeVineyard);
          this.statService.getNDVIStats(this.activeVineyard);
          this.integrationsService.getIntegrations(this.activeVineyard);
        }
      });

    this.vintageService
      .getVintageListener()
      .pipe(takeUntil(this._destroy))
      .subscribe((vintages: Vintage[]) => {
        if (this.activePage === 'vintages' && this.activeRoute.snapshot.params.subId) {
          this.activeVintage = vintages.find((v: Vintage) => v.id === this.activeRoute.snapshot.params.subId);
        }
      });
    this.activeSeasons$.pipe(takeUntil(this._destroy)).subscribe((seasons: number[]) => (this.activeSeasons = seasons));
  }

  setSeasons(years: number[]): void {
    this.seasonService.setActiveSeasons(years);
    this.closeMenu();
  }

  openTab(tab: MenuTab): void {
    if (tab !== this.activePage) {
      this.activePage = tab;
      if (tab !== 'vintages') {
        this.location.go(`/vineyard/view/${this.activeVineyard.id}/${tab}`);
      }
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

  async openAddVintageModal(vintage?: Vintage) {
    const modal = await this.modalController.create({
      component: AddVintageComponent,
      componentProps: {
        vineyard: this.activeVineyard,
        vintage,
      },
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.vintage) {
      await this.parseVintage(data.data.vintage);
    }
  }

  private async parseVintage(vintage: Vintage) {
    vintage.id
      ? await this.vintageService.updateVintage(this.activeVineyard, vintage)
      : await this.vintageService.addVintage(this.activeVineyard, vintage);
  }

  openOverview() {
    this.navController.navigateBack('/');
  }

  ngOnDestroy(): void {
    this._destroy.next(true);
  }

  openVintage(vintage: Vintage) {
    this.activeVintage = vintage;
    this.openTab(MenuTab.VINTAGES);
    this.location.go(`/vineyard/view/${this.activeVineyard.id}/vintages/${vintage.id}`);
  }

  protected readonly VineyardPermissions = VineyardPermissions;
}
