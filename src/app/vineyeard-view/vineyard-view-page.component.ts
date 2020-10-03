import { Platform } from '@ionic/angular';
import { Vineyard } from './../models/vineyard.model';
import { VineyardService } from './../services/vineyard.service';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { RouterStateSnapshot, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-vineyeard-view',
  templateUrl: './vineyard-view-page.component.html',
  styleUrls: ['./vineyard-view-page.component.scss'],
})
export class VineyardViewPage implements OnInit, OnDestroy, AfterViewInit {

  constructor( public vineyardService: VineyardService, private activeRoute: ActivatedRoute, private router: Router, private location: Location) { }

  public seasons: number[];

  public activeVineyard: Vineyard;
  public activeSeasons: number[];

  private _destroy: Subject<boolean>;

  public activePage: 'info' | 'actions' | 'stats' | 'vintages';

  ngOnInit() {
    this._destroy = new Subject<boolean>();
    this.activePage = 'info';
  }
  
  ngAfterViewInit() {
    this.activePage = this.activeRoute.snapshot.params.tab;
    this.vineyardService.getVineyardsListener().pipe(
      takeUntil(this._destroy)
    ).subscribe((vineyards: Vineyard[]) => {
      this.activeVineyard = vineyards.find((v: Vineyard) => v.id === this.activeRoute.snapshot.params.id);
      if (this.activeVineyard) {
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
      this.location.go(`/vineyard/view/${this.activeVineyard.id}/${tab}`);
    }
  }

  ngOnDestroy(): void {
    this._destroy.next(true);
  }

}
