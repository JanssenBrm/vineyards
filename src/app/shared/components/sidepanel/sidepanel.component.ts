import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Vineyard} from '../../../models/vineyard.model';
import {MenuController} from '@ionic/angular';
import {VineyardService} from '../../../services/vineyard.service';
import View from 'ol/View';
import { Map as olMap } from 'ol';
import TileLayer from 'ol/layer/Tile';
import {XYZ} from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import {Season} from '../../../models/season.model';
import {Variety} from '../../../models/variety.model';

@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.scss'],
})
export class SidepanelComponent implements OnInit, OnChanges {

  @Input()
  activeVineyard: Vineyard;

  @Input()
  season: number;

  constructor( private menuController: MenuController, private vineyardService: VineyardService) { }

  private _map: olMap;
  private _featureLayer: VectorLayer;

  public activeSeason: Season;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.activeVineyard) {
      console.log(this.activeVineyard);
      if (this.activeVineyard) {
        this.menuController.open();

       /* if (!this.season && this.activeVineyard.seasons.length > 0) {
          this.season = this.activeVineyard.seasons[0].year;
          this.setActiveSeason(this.season);
        }*/
      }
    }
  }

  public setActiveSeason(year: number): void {
   // this.activeSeason = this.activeVineyard.seasons.find((s: Season) => s.year === year);
    console.log(this.activeSeason);
  }

  public getTotalPlantCount(varieties: Variety[]): number{
    return varieties ? varieties.map((v: Variety) => v.rows * v.platsPerRow).reduce((sum: number, count: number, idx: number) => sum + count) : 0;
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
    this._featureLayer.getSource().addFeature(new Feature(this.activeVineyard.location));
    setTimeout(() => {
      this._map.updateSize();
      this._map.getView().fit(this.activeVineyard.location, {size: this._map.getSize(), padding: [10, 10, 10, 10]});
    }, 500);
  }

  menuOpened(): void {
    if (this.activeVineyard) {
      this._createMap();
    }
  }

  menuClosed(): void {
     this.vineyardService.setActiveVineyard(null);
  }

}
