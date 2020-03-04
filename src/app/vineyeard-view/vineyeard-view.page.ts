import { Platform } from '@ionic/angular';
import { Vineyard } from './../models/vineyard.model';
import { VineyardService } from './../services/vineyard.service';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import View from 'ol/View';
import { Map as olMap } from 'ol';
import TileLayer from 'ol/layer/Tile';
import {XYZ} from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { RouterStateSnapshot, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vineyeard-view',
  templateUrl: './vineyeard-view.page.html',
  styleUrls: ['./vineyeard-view.page.scss'],
})
export class VineyeardViewPage implements OnInit, OnDestroy, AfterViewInit {

  constructor( public vineyardService: VineyardService, private activeRoute: ActivatedRoute, private platform: Platform) { }

  public seasons: number[];

  public activeVineyard: Vineyard;
  public activeSeason: number;

  private _destroy: Subject<boolean>;
  private _map: olMap;
  private _featureLayer: VectorLayer;

  ngOnInit() {
    this._destroy = new Subject<boolean>();
  }

  ngAfterViewInit() {
    this.vineyardService.getVineyards().pipe(
      takeUntil(this._destroy)
    ).subscribe((vineyards: Vineyard[]) => {
      this.activeVineyard = vineyards.find((v: Vineyard) => v.id === this.activeRoute.snapshot.params.id);
      if (this.activeVineyard) {
        this._createMap();
        this.seasons = this.vineyardService.getYears(this.activeVineyard);
      }
    });
    this.vineyardService.getActiveSeason().pipe(
      takeUntil(this._destroy)
    ).subscribe((season: number) => {
      this.activeSeason = season;
    });

    this.platform.ready().then(() => {
      this.platform.resize.subscribe(() => {
        console.log("RESIZE");
        this._map.updateSize();
      });
    });

  }

  setSeason(year: number): void {
    this.vineyardService.setActiveSeason(year);
  }


  private _createMap() {
    if (!this._map) {
      console.log('Creating map',  document.getElementById('vineyard-map'));
      this._featureLayer =  new VectorLayer({
        source: new VectorSource({
          features: []
        })
      });
      this._map = new olMap({
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://api.mapbox.com/styles/v1/bramjanssen/ck77to6kv269x1ipk96lk1udu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnJhbWphbnNzZW4iLCJhIjoiY2s3N3RraXY1MDlqYTNmcGQ5MXRlc253MyJ9.nivXa7rSweT_gUHI80CKIw'
            })
          }),
            this._featureLayer

        ],
        target: document.getElementById('vineyard-map'),
        view: new View({
          center: [0, 0],
          zoom: 10
        })
      });
    }
    this._featureLayer.getSource().clear();
    this._featureLayer.getSource().addFeature(new Feature(this.activeVineyard.location));
    setTimeout(() => {
      this._map.updateSize();
      this._map.getView().fit(this.activeVineyard.location, {size: this._map.getSize(), padding: [10, 10, 10, 10]});
    }, 500);
  }


  ngOnDestroy(): void {
    this._destroy.next(true);
  }

}
