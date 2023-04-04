import { UtilService } from './../../services/util.service';
import { Variety } from './../../models/variety.model';
import { Platform } from '@ionic/angular';
import { Vineyard } from './../../models/vineyard.model';
import { VineyardService } from './../../services/vineyard.service';
import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import View from 'ol/View';
import { Map as olMap } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Action, ActionType } from 'src/app/models/action.model';
import { VarietyService } from '../../services/variety.service';
import { ActionService } from '../../services/action.service';
import * as moment from 'moment';
import { FeaturesService } from '../../services/features.service';
import { Geometry } from 'ol/geom';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnChanges, AfterViewInit {
  @Input()
  vineyard: Vineyard;

  @Input()
  varieties: Variety[];

  @Input()
  actions: Action[];

  private _map: olMap;

  private _featureLayer: VectorLayer<VectorSource>;

  private actionTypes: string[] = Object.keys(ActionType);

  public historicActions: Action[];

  constructor(
    public utilService: UtilService,
    public vineyardService: VineyardService,
    private platform: Platform,
    public varietyService: VarietyService,
    public actionService: ActionService,
    public featuresService: FeaturesService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this._createMap();
    }
    if (changes.actions) {
      this.historicActions = this.setHistoricActions(this.actions);
    }
  }

  setHistoricActions(actions: Action[]): Action[] {
    const count = 1;
    const unit = 'weeks';
    const range = [moment().add(-count, unit).add(-1, 'year'), moment().add(count, unit).add(-1, 'year')];
    return actions.filter(
      (a: Action) => moment(a.date).isSameOrAfter(range[0]) && moment(a.date).isSameOrBefore(range[1])
    );
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
      this._featureLayer = new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
      });
      this._map = new olMap({
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
            }),
          }),
          this._featureLayer,
        ],
        target: document.getElementById('vineyard-map'),
        view: new View({
          center: [0, 0],
          zoom: 10,
        }),
      });
    }
    this._featureLayer.getSource().clear();
    this._featureLayer.getSource().addFeature(new Feature(this.vineyard.location));
    setTimeout(() => {
      this._map.updateSize();
      this._map.getView().fit(this.vineyard.location, { size: this._map.getSize(), padding: [20, 20, 20, 20] });
    }, 500);
  }

  getTotalCount(): number {
    return this.varietyService.getPlantCount(this.varieties);
  }
}
