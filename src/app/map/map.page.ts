import { XYZ } from 'ol/source.js';
import { UtilService } from './../services/util.service';
import { Vineyard } from './../models/vineyard.model';
import { ApiService } from './../services/api.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Map as olMap } from 'ol';
import {get as getProjection} from 'ol/proj';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import {getWidth, getTopLeft} from 'ol/extent';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage implements OnInit, AfterViewInit {
  constructor(
    private apiService: ApiService,
    private utilService: UtilService
  ) {}

  private _map: olMap;
  private _featureLayer: VectorLayer;

  ngOnInit() {}

  ngAfterViewInit() {
    this._featureLayer = this._getFeatureLayer();
    this._map = new olMap({
      layers: [
        this._getBaseMap(),
        this._featureLayer
      ],
      target: document.getElementById('map'),
      view: new View({
        center: [0, 0]
      })
    });
    setTimeout(() => {
      this._map.updateSize();
    }, 500);
    this._getData();
  }

  private _getFeatureLayer(): VectorLayer {
    return new VectorLayer ({
       source: new VectorSource({
        features: []
      })
    });
  }
  private _getBaseMap(): TileLayer {
   /* const projection = getProjection('EPSG:3857');
    const projectionExtent = projection.getExtent();
    const size = getWidth(projectionExtent) / 256;
    const resolutions = new Array(20);
    const matrixIds = new Array(20);
    for (let z = 0; z < resolutions.length; ++z) {
      // generate resolutions and matrixIds arrays for this WMTS
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = z;
    }
    return new TileLayer({
      source: new WMTS({
        url:
          'http://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts',
        layer: 'omzrgb18vl',
        matrixSet: 'GoogleMapsVL',
        format: 'image/png',
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(projectionExtent),
          resolutions,
          matrixIds
        })
      })
    });*/
    return new TileLayer({
      source: new XYZ({
        url: 'https://api.mapbox.com/styles/v1/bramjanssen/ck77to6kv269x1ipk96lk1udu/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYnJhbWphbnNzZW4iLCJhIjoiY2s3N3RraXY1MDlqYTNmcGQ5MXRlc253MyJ9.nivXa7rSweT_gUHI80CKIw'
      })
    });
  }

  private _getData(): void {
    this.apiService.getVineyards().subscribe((vineyards: Vineyard[]) => {
      const center = this.utilService.getExtent(
        vineyards.map((v: Vineyard) => v.location)
      );
      this._featureLayer.getSource().addFeatures(vineyards.map((v: Vineyard) => new Feature ({
        geometry: v.location,
        name: v.id
      })));
      this._map.getView().fit(center);
    });
  }
}
