import { UtilService } from './../../services/util.service';
import { Modify } from 'ol/interaction/Modify';
import { AddActionComponent } from './../add-action/add-action.component';
import { Variety } from './../../models/variety.model';
import { Platform, ModalController } from '@ionic/angular';
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
import { Action, ActionType } from 'src/app/models/action.model';
import { ObjectUnsubscribedError } from 'rxjs';
import * as uuid from 'uuid';

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

  private actionTypes: string[] = Object.keys(ActionType);

  constructor(public utilService: UtilService, public vineyardService: VineyardService, private platform: Platform, private modalController: ModalController) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this._createMap();
    }
  }


  ngAfterViewInit() {
    this.platform.ready().then(() => {
      this.platform.resize.subscribe(() => {
        if (this._map) {
          this._map.updateSize();
        }
      });
    });
  }

  private _createMap() {
    if (!this._map) {
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

  async openAddActionModal() {
    const modal = await this.modalController.create({
      component: AddActionComponent,
      componentProps: {
        vineyard: this.vineyard
      }
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.action) {
     this.parseAction(data.data.action);
    }
  }

  parseAction(data: any) {

    let id = null;

    if (data.type === 'planting') {
      id = uuid.v4();
      this.vineyard.varieties.push({
        id,
        plantsPerRow: data.plantsPerRow,
        name: data.variety,
        rows: data.rows
      });
    }

    const action: Action = {
      type: data.type,
      date: data.date,
      description: data.description,
      bbch: data.bbch,
      variety: id ? [id] : data.varietyId,
      value: data.value
    };

    this.vineyard.actions.push(action);
    this.vineyardService.updateVineyard(this.vineyard);
  }

}
