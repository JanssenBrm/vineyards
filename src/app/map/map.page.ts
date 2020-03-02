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

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage implements OnInit, AfterViewInit {
  constructor(
    public vineyardService: VineyardService,
    private utilService: UtilService
  ) {}

  private _map: olMap;
  private _featureLayer: VectorLayer;
  private _select: Select;
  private _overlay: Overlay;

  public activeVineyard: Vineyard;
  public activeSeason: number;
  public seasons: number[];

  ngOnInit() {}

  ngAfterViewInit() {
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
        center: [0, 0],
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
    this.vineyardService.getVineyards().subscribe((vineyards: Vineyard[]) => {
      const center = this.utilService.getExtent(
        vineyards.map((v: Vineyard) => v.location)
      );
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

      if (!this.activeSeason && this.seasons.length > 0) {
        this.activeSeason = this.seasons[this.seasons.length - 1];
      }
    });

    this.vineyardService.getActiveVineyard().subscribe((vineyard: Vineyard) => {
      if (!vineyard) {
        this._select.getFeatures().clear();
      }
    });
  }

  setActiveVineyard(info: Vineyard): void {
    this.vineyardService.setActiveVineyard(info.id);
  }

  getVariety(info: Vineyard, season: number): string {
    const varities = season
      ? this.vineyardService.getVarieties(info, season)
      : this.vineyardService.getLatestVarieties(info);
    return varities.map((v: Variety) => v.name).join(', ');
  }

  getVarietyCount(info: Vineyard, season: number): number {
    const varities = season
      ? this.vineyardService.getVarieties(info, season)
      : this.vineyardService.getLatestVarieties(info);
    return varities.length > 0 ? varities.map((v: Variety) => v.platsPerRow * v.rows).reduce((sum: number, count: number, idx: number) => sum + count) : 0;
  }

  setSeason(year: number): void {
    this.activeSeason = year;
  }
}
