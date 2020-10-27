import {MenuController, NavController, Platform} from '@ionic/angular';
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

@Component({
  selector: 'app-vineyeard-view',
  templateUrl: './vineyard-view-page.component.html',
  styleUrls: ['./vineyard-view-page.component.scss'],
})
export class VineyardViewPage implements OnInit, OnDestroy, AfterViewInit {

  constructor( public vineyardService: VineyardService, private activeRoute: ActivatedRoute, private router: Router, private location: Location, private menuController: MenuController,
               private navController: NavController, public vintageService: VintageService,
               private varietyService: VarietyService,
               private actionService: ActionService,
               private seasonService: SeasonsService) { }

  public seasons$: Observable<number[]>;
  public activeSeasons$: BehaviorSubject<number[]>;

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
  }

  setSeasons(years: number[]): void {
    this.seasonService.setActiveSeasons(years);
  }

  openTab(tab: 'info' | 'actions' | 'stats' | 'vintages'): void {
    if (tab !== this.activePage) {
      this.activePage = tab;
      this.location.go(`/vineyard/view/${this.activeVineyard.id}/${tab}`);
    }
    this.menuController.close();
  }

  openOverview() {
    this.navController.navigateBack('/');
  }

  ngOnDestroy(): void {
    this._destroy.next(true);
  }

  toggleSubmenu(menu: string) {
    if (this.activeSubMenus.includes(menu)) {
      this.activeSubMenus = this.activeSubMenus.filter((m: string) => m != menu);
    } else {
      this.activeSubMenus.push(menu);
    }
  }

  openVintage(vintage: Vintage) {
    this.activeVintage = vintage;
    this.openTab('vintages');
  }

}
