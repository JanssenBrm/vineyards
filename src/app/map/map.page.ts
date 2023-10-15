import { MapMode } from './../models/mapmode.model';
import { Variety } from './../models/variety.model';
import { XYZ } from 'ol/source';
import { transformExtent } from 'ol/proj';
import { buffer } from 'ol/extent';
import { UtilService } from './../services/util.service';
import { Vineyard } from './../models/vineyard.model';
import { VineyardService } from '../services/vineyard.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { VarietyService } from '../services/variety.service';
import { Action } from '../models/action.model';
import { ActionService } from '../services/action.service';
import { SeasonsService } from '../services/seasons.service';
import { AuthService } from '../services/auth.service';
import { User } from 'firebase';
import { Layer } from '../models/layer.model';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { AddVineyardComponent } from './addvineyard/addvineyard.component';
import { ConfirmComponent } from '../shared/components/confirm/confirm.component';
import { NON_PREMIUM_ROLES } from '../models/userdata.model';
import { Fill, Stroke, Style } from 'ol/style';
import * as mapboxgl from 'mapbox-gl';
import { GeoJSONSource } from 'mapbox-gl';
import { environment } from '../../environments/environment';
import center from '@turf/center';
import { Polygon } from 'geojson';
import { BACKGROUND_LAYERS } from '../conf/layers.config';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {
  @ViewChild('popupcontent', { static: false }) popupDiv: ElementRef;

  public dirty: string[] = [];

  public activeVineyard: Vineyard;

  public activeSeasons: number[];

  public seasons: number[];

  public mapMode: MapMode;

  public varieties: BehaviorSubject<Variety[]>;

  public actions: BehaviorSubject<Action[]>;

  public user: BehaviorSubject<User>;

  private _map: mapboxgl.Map;

  private _featureLayer: VectorLayer;

  private _select: Select;

  private _modify: Modify;

  private _draw: Draw;

  private _remove: Select;

  private _snap: Snap;

  private _overlay: Overlay;

  private _destroy: Subject<boolean>;

  private _init: boolean;

  private view: View;

  private readonly OWNED_VINEYARD_SOURCE = 'owned-vineyards';

  private readonly SHARED_VINEYARD_SOURCE = 'shared-vineyards';

  constructor(
    public vineyardService: VineyardService,
    public utilService: UtilService,
    public router: Router,
    private varietyService: VarietyService,
    private actionService: ActionService,
    private seasonService: SeasonsService,
    private authService: AuthService,
    private http: HttpClient,
    private modalController: ModalController
  ) {
    this._init = true;
  }

  ngOnInit() {
    this.varieties = this.varietyService.getVarietyListener();
    this.actions = this.actionService.getActionListener();
    this.seasons = [];
    this.user = this.authService.getUser();
  }

  ngAfterViewInit() {
    this.dirty = [];
    this._destroy = new Subject<boolean>();
    this._featureLayer = this._getFeatureLayer();

    this.view = new View({
      center: [0, 1000000],
      zoom: 3,
    });

    this._map = new mapboxgl.Map({
      accessToken: environment.mapboxKey,
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: {
        name: 'globe',
      },
      center: [0, 0],
      zoom: 3,
    });

    this._map.on('style.load', () => {
      this._map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.terrain-rgb',
      });

      this._map.setTerrain({
        source: 'mapbox-dem',
        exaggeration: 1.5,
      });
    });

    this._map.on('load', () => {
      this.addBackgroundLayers();
      this.addVineyardLayers(this.OWNED_VINEYARD_SOURCE, false);
      this.addVineyardLayers(this.SHARED_VINEYARD_SOURCE, true);

      this._map.resize();
      this._getData();
    });

    // new olMap({
    //   layers: [this._getBaseMap(), this._featureLayer],
    //   target: document.getElementById('map'),
    //   overlays: [this._overlay, this.clickOverlay],
    //   view: this.view,
    // });

    // this._select = this._getSelectInteraction();
    // this._map.addInteraction(this._select);
    //
    // this._map.on('singleclick', (event) => {
    //   const requests = this.backgroundLayers
    //     ? this.backgroundLayers
    //         .map((l: Layer) => {
    //           const layer = this._getMapLayer(l);
    //           if (layer && l.enabled && l.click) {
    //             return this.http
    //               .get(
    //                 layer.getSource().getFeatureInfoUrl(event.coordinate, this.view.getResolution(), 'EPSG:3857', {
    //                   INFO_FORMAT: 'application/json',
    //                 })
    //               )
    //               .pipe(
    //                 switchMap((data: any) => of(l.click(data))),
    //                 catchError(() => of(''))
    //               );
    //           } else {
    //             return null;
    //           }
    //         })
    //         .filter((r: any) => !!r)
    //     : [];
    //   if (requests.length > 0) {
    //     forkJoin(requests).subscribe((results: string[]) => {
    //       this.clickText = results.filter((r: string) => r !== '').join('<br/>');
    //       this.clickOverlay.setPosition(event.coordinate);
    //     });
    //   }
    // });

    this._modify = this._getModifyInteraction();
    this._draw = this._getDrawInteraction();
    this._remove = this._getRemoveInteraction();

    setTimeout(() => {}, 500);
  }

  addBackgroundLayers() {
    BACKGROUND_LAYERS.map((l: Layer) => {
      this._map.addSource(l.id, {
        type: 'raster',
        tiles: [l.url],
        tileSize: 256,
      });
      this._map.addLayer({
        id: l.id,
        type: 'raster',
        source: l.id,
        layout: {
          visibility: 'none',
        },
      });
    });
  }

  addVineyardLayers(source: string, shared: boolean) {
    this._map.addSource(source, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
    this._map.addLayer({
      id: source,
      type: 'fill',
      source: source,
      paint: {
        'fill-color': this.getFeatureColors(shared)[0],
        'fill-opacity': 0.5,
      },
    });

    this._map.addLayer({
      id: `${source}-outline`,
      type: 'line',
      source: source,
      paint: {
        'line-color': this.getFeatureColors(shared)[1],
        'line-width': 5,
      },
    });

    this._map.on('click', source, (e) => {
      // Copy coordinates array.
      const coordinates = center(e.features[0].geometry as Polygon);
      this.activeVineyard = this.vineyardService.getInfo(e.features[0].properties.name);

      const popup = new mapboxgl.Popup()
        .setLngLat(coordinates.geometry.coordinates as [number, number])
        .setHTML('<div style="text-align: center"><ion-spinner name="crescent" color="primary"></ion-spinner></div>')
        .addTo(this._map);

      merge(this.actions, this.varieties).subscribe({
        next: () => {
          setTimeout(() => {
            const visible: HTMLDivElement = this.popupDiv.nativeElement.cloneNode(true);
            visible.style.display = 'block';
            visible.children[visible.children.length - 1].children[0].children
              .namedItem('showVineyardInfo')
              .addEventListener('click', () => this.openVineyard(this.activeVineyard));
            popup.setDOMContent(visible);
          }, 500);
        },
      });
      this.varietyService.getVarieties(this.activeVineyard);
      this.actionService.getActions(this.activeVineyard);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    this._map.on('mouseenter', source, () => {
      this._map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    this._map.on('mouseleave', source, () => {
      this._map.getCanvas().style.cursor = '';
    });
  }

  openVineyard(info: Vineyard): void {
    console.log('Opening vineyards');
    this.router.navigate([`/vineyard/view/${info.id}/info`]);
  }

  getVarieties(varieties: Variety[]): string {
    return varieties ? [...new Set(varieties.map((v: Variety) => v.name))].join(', ') : '';
  }

  getVarietyCount(varieties: Variety[]): number {
    return this.varietyService.getPlantCount(varieties);
  }

  getLastUpdate(actions: Action[]): moment.Moment {
    return this.actionService.getLastUpdate(actions);
  }

  setSeasons(years: number[]): void {
    this.vineyardService.setActiveSeasons(years);
  }

  updateState(save: boolean): void {
    if (!save) {
      this.vineyardService.getVineyards();
    } else {
      this.vineyardService.saveVineyards(this.dirty);
    }
    this.dirty = [];
    this.setMapMode(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setMapMode(mode: MapMode) {
    // this.mapMode = mode;
    //
    // if (this.mapMode === MapMode.Edit) {
    //   this._map.addInteraction(this._modify);
    // } else {
    //   this._map.removeInteraction(this._modify);
    // }
    //
    // if (this.mapMode === MapMode.Add) {
    //   this._map.addInteraction(this._draw);
    // } else {
    //   this._map.removeInteraction(this._draw);
    // }
    //
    // if (this.mapMode === MapMode.Remove) {
    //   this._map.addInteraction(this._remove);
    // } else {
    //   this._map.removeInteraction(this._remove);
    // }
    //
    // if (this.mapMode === undefined) {
    //   this._map.addInteraction(this._select);
    // } else {
    //   this._map.removeInteraction(this._select);
    // }
  }

  public updateBackgroundLayers(layers: Layer[]) {
    layers.forEach((l: Layer) => {
      this._map.setLayoutProperty(l.id, 'visibility', l.enabled ? 'visible' : 'none');
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public _getMapLayer(l: Layer): any {
    return [];
    // return this._map.getLayers().array_.find((mLayer: any) => mLayer.get('id') === l.id);
  }

  private _getSelectInteraction(): Select {
    const select = new Select();
    select.on('select', (feature: any) => {
      if (feature.selected && feature.selected.length > 0) {
        this.activeVineyard = this.vineyardService.getInfo(feature.selected[0].get('name'));
        this.varietyService.getVarieties(this.activeVineyard);
        this.actionService.getActions(this.activeVineyard);
        this._overlay.setPosition(feature.mapBrowserEvent.coordinate);
      } else {
      }
    });
    return select;
  }

  private _getRemoveInteraction(): Select {
    const select = new Select();
    select.on('select', async (feature: any) => {
      if (feature.selected && feature.selected.length > 0) {
        await this.openDeleteConfirmModal(feature.selected[0]);
      }
    });
    return select;
  }

  private _getModifyInteraction(): Modify {
    const modify = new Modify({ source: this._featureLayer.getSource() });
    modify.on('modifyend', (event: any) => {
      event.features.forEach((f: Feature) => {
        this.dirty.push(f.get('name'));
        this.vineyardService.updateLocation(f.get('name'), f.getGeometry());
      });
    });
    return modify;
  }

  private _getDrawInteraction(): Draw {
    const modify = new Draw({ source: this._featureLayer.getSource(), type: 'Polygon' });
    modify.on('drawend', async (event: any) => {
      await this.openAddVineyardModal(event.feature);
    });
    return modify;
  }

  async openAddVineyardModal(f: Feature) {
    const modal = await this.modalController.create({
      component: AddVineyardComponent,
      componentProps: {
        geometry: f.getGeometry(),
      },
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data) {
      console.log(data.data);
      if (!data.data.vineyard) {
        this._draw.source_.removeFeature(f);
      } else {
        await this.vineyardService.addVineyard(
          data.data.vineyard.name,
          data.data.vineyard.address,
          data.data.vineyard.geometry
        );
      }
    }
  }

  async openDeleteConfirmModal(f: Feature) {
    const modal = await this.modalController.create({
      component: ConfirmComponent,
      componentProps: {
        message: `Are you sure you want to delete vineyard ${f.get('title')}?`,
      },
    });
    modal.present();
    const data = await modal.onWillDismiss();
    if (data.data && data.data.confirm) {
      await this.vineyardService.deleteVineyard(f.get('name'));
    } else {
      this._remove.getFeatures().clear();
    }
  }

  private _getFeatureStyle(feature: Feature): Style {
    const [fill, stroke] = this.getFeatureColors(feature.get('shared'));
    return new Style({
      fill: new Fill({
        color: fill,
      }),
      stroke: new Stroke({
        color: stroke,
        width: 5,
      }),
    });
  }

  public getFeatureColors(shared: boolean): [string, string] {
    return shared ? ['rgba(193,95,232,0.5)', 'rgb(175,86,210)'] : ['rgba(95, 118, 232, 0.5)', 'rgb(86,107,210)'];
  }

  private _getFeatureLayer(): VectorLayer {
    return new VectorLayer({
      zIndex: 99,
      source: new VectorSource({
        features: [],
      }),
      style: (feature) => this._getFeatureStyle(feature),
    });
  }

  private _getBaseMap(): TileLayer {
    return new TileLayer({
      source: new XYZ({
        url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
      }),
    });
  }

  private _getData(): void {
    this.vineyardService
      .getVineyardsListener()
      .pipe(takeUntil(this._destroy))
      .subscribe((vineyards: Vineyard[]) => {
        if (vineyards.length > 0) {
          const features: GeoJSON.Feature[] = vineyards.map((v: Vineyard) => ({
            type: 'Feature',
            geometry: v.location,
            properties: {
              name: v.id,
              title: v.name,
              shared: v.shared,
            },
          }));
          (this._map.getSource(this.OWNED_VINEYARD_SOURCE) as GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: features.filter((f: Feature) => !f.properties.shared),
          });

          (this._map.getSource(this.SHARED_VINEYARD_SOURCE) as GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: features.filter((f: Feature) => f.properties.shared),
          });

          if (this._init) {
            const bounds = this.utilService.getExtent(vineyards.map((v: Vineyard) => v.location));
            this._map.fitBounds(bounds, { maxZoom: 18 });
            this._init = false;
          }
        }
      });

    this.vineyardService
      .getActiveVineyard()
      .pipe(takeUntil(this._destroy))
      .subscribe((vineyard: Vineyard) => {
        if (!vineyard) {
          //f   this._select.getFeatures().clear();
        }
      });

    this.vineyardService
      .getActiveSeasons()
      .pipe(takeUntil(this._destroy))
      .subscribe((seasons: number[]) => {
        this.activeSeasons = seasons;
      });
  }

  zoomToLocation(extent: number[]) {
    this.view.fit(buffer(transformExtent(extent, 'EPSG:4326', 'EPSG:3857'), 100));
  }

  public readonly NON_PREMIUM_ROLES = NON_PREMIUM_ROLES;
}
