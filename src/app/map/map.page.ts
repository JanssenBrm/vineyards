import { Season } from './../models/season.model';
import { Variety } from './../models/variety.model';
import { Polygon } from 'ol/geom/Polygon';
import { XYZ } from 'ol/source.js';
import { UtilService } from './../services/util.service';
import { Vineyard } from './../models/vineyard.model';
import { VineyardService } from '../services/vineyard.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Map as olMap } from 'ol';
import { get as getProjection } from 'ol/proj';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import { getWidth, getTopLeft } from 'ol/extent';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage implements OnInit, AfterViewInit {
  constructor(
    public vineyardService: VineyardService,
    private utilService: UtilService,
    private router: Router
  ) {}

  private _map: olMap;
  private _featureLayer: VectorLayer;
  private _select: Select;
  private _overlay: Overlay;
  private _destroy: Subject<boolean>;

  public activeVineyard: Vineyard;
  public activeSeasons: number[];
  public seasons: number[];

  ngOnInit() {}

  ngAfterViewInit() {
    this._destroy = new Subject<boolean>();
    this._featureLayer = this._getFeatureLayer();

    this._overlay = new Overlay({
      element: document.getElementById('popup'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });

    this._map = new olMap({
      layers: [this._getBaseMap(), this._featureLayer],
      target: document.getElementById('map'),
      overlays: [this._overlay],
      view: new View({
        center: [573381.618724, 6662862.881562],
        zoom: 10
      })
    });
    this._select = this._getSelectInteraction();
    this._map.addInteraction(this._select);
    setTimeout(() => {
      this._map.updateSize();
      this._getData();
    }, 500);
  }

  closePopup() {
    this._overlay.setPosition(undefined);
    this._select.getFeatures().clear();
    return false;
  }

  private _getSelectInteraction(): Select {
    const select = new Select();
    select.on('select', (feature: any) => {
      if (feature.selected && feature.selected.length > 0) {
        this.activeVineyard = this.vineyardService.getInfo(
          feature.selected[0].get('name')
        );
        this._overlay.setPosition(feature.mapBrowserEvent.coordinate);
      } else {
        this.closePopup();
      }
    });
    return select;
  }

  private _getFeatureLayer(): VectorLayer {
    return new VectorLayer({
      source: new VectorSource({
        features: []
      })
    });
  }
  private _getBaseMap(): TileLayer {
    return new TileLayer({
      source: new XYZ({
        url:
          'https://api.mapbox.com/styles/v1/bramjanssen/ck77to6kv269x1ipk96lk1udu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnJhbWphbnNzZW4iLCJhIjoiY2s3N3RraXY1MDlqYTNmcGQ5MXRlc253MyJ9.nivXa7rSweT_gUHI80CKIw'
      })
    });
  }

  private _getData(): void {
    this.vineyardService
      .getVineyards()
      .pipe(takeUntil(this._destroy))
      .subscribe((vineyards: Vineyard[]) => {
        console.log('VINEYARD', vineyards);
        if (vineyards.length > 0) {
          const center = this.utilService.getExtent(
            vineyards.map((v: Vineyard) => v.location)
          );
          this._featureLayer.getSource().clear();
          this._featureLayer.getSource().addFeatures(
            vineyards.map(
              (v: Vineyard) =>
                new Feature({
                  geometry: v.location,
                  name: v.id
                })
            )
          );
          this._map
            .getView()
            .fit(center, { size: this._map.getSize(), maxZoom: 18 });

          this.seasons = this.vineyardService.getSeasons();
        }
      });

    this.vineyardService
      .getActiveVineyard()
      .pipe(takeUntil(this._destroy))
      .subscribe((vineyard: Vineyard) => {
        if (!vineyard) {
          this._select.getFeatures().clear();
        }
      });

    this.vineyardService
      .getActiveSeasons()
      .pipe(takeUntil(this._destroy))
      .subscribe((seasons: number[]) => {
        this.activeSeasons = seasons;
      });
  }

  openVineyard(info: Vineyard): void {
    this.router.navigate([`/vineyard/view/${info.id}/info`]);
  }

  getVariety(info: Vineyard, seasons: number[]): string {
    return seasons && info
      ? [
          ...new Set(
            this.vineyardService
              .getVarieties(info, Math.max(...seasons))
              .map((v: Variety) => v.name)
          )
        ].join(', ')
      : '';
  }

  getVarietyCount(info: Vineyard, seasons: number[]): number {
    return seasons && info
      ? this.vineyardService.getPlantCount(info, Math.max(...seasons))
      : undefined;
  }

  getLastUpdate(info: Vineyard): string {
    return this.vineyardService.getLastUpdate(info);
  }

  setSeasons(years: number[]): void {
    this.vineyardService.setActiveSeasons(years);
  }
}
