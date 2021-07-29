import {MenuController, ModalController, NavController, Platform} from '@ionic/angular';
import { Vineyard } from './../models/vineyard.model';
import { VineyardService } from './../services/vineyard.service';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import {Subject, Observable, BehaviorSubject} from 'rxjs';
import { RouterStateSnapshot, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {VintageService} from '../services/vintage.service';
import {Vintage} from '../models/vintage.model';
import {VarietyService} from '../services/variety.service';
import {Action} from '../models/action.model';
import {ActionService} from '../services/action.service';
import {SeasonsService} from '../services/seasons.service';
import {Variety} from '../models/variety.model';
import {AddVintageComponent} from './add-vintage/add-vintage.component';

@Component({
  selector: 'app-vineyeard-view',
  templateUrl: './vineyard-view-page.component.html',
  styleUrls: ['./vineyard-view-page.component.scss'],
})
export class VineyardViewPage implements OnInit, OnDestroy, AfterViewInit {

  constructor( public vineyardService: VineyardService,
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
               private modalController: ModalController) { }

  public seasons$: BehaviorSubject<number[]>;
  public activeSeasons$: BehaviorSubject<number[]>;
  public activeSeasons: number[];

  public activeVineyard: Vineyard;

  private _destroy: Subject<boolean>;
  public vintages$: BehaviorSubject<Vintage[]> = null;

  public activePage: 'info' | 'actions' | 'stats' | 'vintages';

  public activeVintage: Vintage;

  public activeSubMenus: string[] = [];

  public actions$: BehaviorSubject<Action[]>;
  public varieties$: BehaviorSubject<Variety[]>;

  ngOnInit() {
    this._destroy = new Subject<boolean>();
    this.vintages$ = this.vintageService.getVintageListener();
    this.actions$ = this.actionService.getActionListener();
    this.seasons$ = this.seasonService.getSeasonListener();
    this.activeSeasons$ = this.seasonService.getActiveSeasonListener();
    this.varieties$ = this.varietyService.getVarietyListener();

    this.activePage = 'info';
  }
  ngAfterViewInit() {
    this.activePage = this.activeRoute.snapshot.params.tab;

    this.vineyardService.getVineyardsListener().pipe(
      takeUntil(this._destroy)
    ).subscribe((vineyards: Vineyard[]) => {
      this.activeVineyard = vineyards.find((v: Vineyard) => v.id === this.activeRoute.snapshot.params.id);
      if (this.activeVineyard) {
        this.varietyService.getVarieties(this.activeVineyard);
        this.vintageService.getVintages(this.activeVineyard);
        this.actionService.getActions(this.activeVineyard);
        this.varietyService.getVarieties(this.activeVineyard);
      }
    });
    this.activeSeasons$.pipe(
        takeUntil(this._destroy)
    ).subscribe((seasons: number[]) => this.activeSeasons = seasons);
  }

  setSeasons(years: number[]): void {
    this.seasonService.setActiveSeasons(years);
    this.closeMenu();
  }

  openTab(tab: 'info' | 'actions' | 'stats' | 'vintages'): void {
    if (tab !== this.activePage) {
      this.activePage = tab;
      this.location.go(`/vineyard/view/${this.activeVineyard.id}/${tab}`);
    }
    this.closeMenu();
  }

  closeMenu(): void {
    if (this.isMobile()) {
      this.menuController.close();
    }
  }

  isMobile(): boolean {
    return ['mobile'].filter((p: string) => this.platform.platforms().includes(p)).length > 0
  }

  async openAddVintageModal(vintage?: Vintage) {
    const modal = await this.modalController.create({
      component: AddVintageComponent,
      componentProps: {
        vineyard: this.activeVineyard,
        vintage
      }
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.vintage) {
      this.parseVintage(data.data.vintage);
    }
  }

  private parseVintage(vintage: Vintage) {
    vintage.id ? this.vintageService.updateVintage(this.activeVineyard, vintage) : this.vintageService.addVintage(this.activeVineyard, vintage);
  }

  openOverview() {
    this.navController.navigateBack('/');
  }

  ngOnDestroy(): void {
    this._destroy.next(true);
  }


  openVintage(vintage: Vintage) {
    this.activeVintage = vintage;
    this.openTab('vintages');
  }

}
