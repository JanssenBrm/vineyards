import { Variety } from './../../models/variety.model';
import { Platform } from '@ionic/angular';
import { Vineyard } from './../../models/vineyard.model';
import { VineyardService } from './../../services/vineyard.service';
import { Component, OnInit, Input, OnDestroy, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import View from 'ol/View';
import { Map as olMap } from 'ol';
import TileLayer from 'ol/layer/Tile';
import {XYZ} from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Action } from 'src/app/models/action.model';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit, OnChanges, AfterViewInit {

  @Input()
  vineyard: Vineyard;

  @Input()
  seasons: number[];

  private _map: olMap;
  private _featureLayer: VectorLayer;

  constructor(public vineyardService: VineyardService, private platform: Platform) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this._createMap();
    }
    console.log(changes);
  }


  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.platform.resize.subscribe(() => {
        console.log('RESIZE');
        if (this._map) {
          this._map.updateSize();
        }
      });
    });
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
    this._featureLayer.getSource().addFeature(new Feature(this.vineyard.location));
    setTimeout(() => {
      this._map.updateSize();
      this._map.getView().fit(this.vineyard.location, {size: this._map.getSize(), padding: [10, 10, 10, 10]});
    }, 500);
  }

  getVarieties(info: Vineyard, seasons: number[]): Variety[] {
    return info ? this.vineyardService.getVarieties(info, Math.max(...seasons)) : [];
  }

  getTotalCount(info: Vineyard, seasons: number[]): number {
    return info ? this.vineyardService.getPlantCount(info, Math.max(...seasons)) : 0;
  }

}
