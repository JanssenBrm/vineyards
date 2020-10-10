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

@Component({
  selector: 'app-vineyeard-view',
  templateUrl: './vineyard-view-page.component.html',
  styleUrls: ['./vineyard-view-page.component.scss'],
})
export class VineyardViewPage implements OnInit, OnDestroy, AfterViewInit {

  constructor( public vineyardService: VineyardService, private activeRoute: ActivatedRoute, private router: Router, private location: Location, private menuController: MenuController,
               private navController: NavController, public vintageService: VintageService,) { }

  public seasons: number[];

  public activeVineyard: Vineyard;
  public activeSeasons: number[];

  private _destroy: Subject<boolean>;
  public vintages$: BehaviorSubject<Vintage[]> = null;

  public activePage: 'info' | 'actions' | 'stats' | 'vintages';

  ngOnInit() {
    this._destroy = new Subject<boolean>();
    this.vintages$ = this.vintageService.getVintageListener();
    this.activePage = 'info';
  }
  
  ngAfterViewInit() {
    this.activePage = this.activeRoute.snapshot.params.tab;
    this.vineyardService.getVineyardsListener().pipe(
      takeUntil(this._destroy)
    ).subscribe((vineyards: Vineyard[]) => {
      this.activeVineyard = vineyards.find((v: Vineyard) => v.id === this.activeRoute.snapshot.params.id);
      if (this.activeVineyard) {
        this.vintageService.getVintages(this.activeVineyard);
        this.seasons = this.vineyardService.getYears(this.activeVineyard);
      }
    });
    this.vineyardService.getActiveSeasons().pipe(
      takeUntil(this._destroy)
    ).subscribe((seasons: number[]) => {
      this.activeSeasons = seasons;
      console.log(this.activeSeasons);
    });

  }

  setSeasons(years: number[]): void {
    this.vineyardService.setActiveSeasons(years);
  }

  openTab(tab: 'info' | 'actions' | 'stats' | 'vintages'): void {
    if (tab !== this.activePage) {
      this.activePage = tab;
      this.menuController.close();
      this.location.go(`/vineyard/view/${this.activeVineyard.id}/${tab}`);
    }
  }

  openOverview() {
    this.navController.back();
  }

  ngOnDestroy(): void {
    this._destroy.next(true);
  }

}
