import { Polygon } from 'ol/geom';
import { VineyardDoc } from './../models/vineyarddoc.model';
import { Vineyard } from './../models/vineyard.model';
import { Variety } from './../models/variety.model';
import { Season } from './../models/season.model';
import { UtilService } from './util.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';
import { Action, ActionType } from '../models/action.model';
import { environment } from 'src/environments/environment';
import {AngularFirestore, DocumentReference, QueryDocumentSnapshot, AngularFirestoreCollection, DocumentChangeAction} from '@angular/fire/firestore';
import { GeoJSON } from 'ol/format';

@Injectable({
  providedIn: 'root'
})
export class VineyardService {

  private _vineyards$: BehaviorSubject<Vineyard[]>;
  private _activeVineyard$: BehaviorSubject<Vineyard>;
  private _activeSeasons$: BehaviorSubject<number[]>;
  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;

  constructor( private http: HttpClient, private utilService: UtilService, private fireStore: AngularFirestore) {
      this._vineyards$ = new BehaviorSubject<Vineyard[]>([]);
      this._activeVineyard$ = new BehaviorSubject<Vineyard>(null);
      this._activeSeasons$ = new BehaviorSubject<number[]>([(new Date()).getFullYear()]);
      this._vineyardCollection = fireStore.collection<VineyardDoc>('vineyards');
      this.getVineyards();
  }

  getVineyardsListener(): Observable<Vineyard[]> {
    return this._vineyards$;
  }

  setActiveVineyard(id: string): void {
    this._activeVineyard$.next(id ? this._vineyards$.getValue().find((v: Vineyard) => v.id === id) : null);
  }

  getActiveVineyard(): Observable<Vineyard> {
    return this._activeVineyard$;
  }

  getActiveSeasons(): Observable<number[]> {
    return this._activeSeasons$;
  }

  setActiveSeasons(seasons: number[]): void {
    this._activeSeasons$.next(seasons);
  }

  getVineyards(): void {
    this._vineyardCollection.snapshotChanges().pipe(
        map((data: DocumentChangeAction<VineyardDoc>[]) => data.map((d: DocumentChangeAction<VineyardDoc>) => (
          {
            ...d.payload.doc.data(),
            id: d.payload.doc.id
          }))),
        map((docs: VineyardDoc[]) => docs.map((d: VineyardDoc) => ({
            ...d,
          location: new Polygon(JSON.parse(d.location).coordinates).transform( 'EPSG:4326', 'EPSG:3857')
        }))),
        map((vineyards: Vineyard[]) => vineyards.map((v: Vineyard) => ({
          ...v,
          actions: v.actions.sort((a1: Action, a2: Action) => (new Date(a1.date).getTime()) < (new Date(a2.date).getTime()) ? 1 : -1)
        })))
    ).subscribe((vineyards: Vineyard[]) => {
       this._vineyards$.next(vineyards);
    });

  }

  getInfo(id: string): Vineyard {
    return this._vineyards$.getValue().find((v: Vineyard) => v.id === id);
  }


  getVarieties(info: Vineyard, year: number = new Date().getFullYear()): Variety[] {
    const plantingActions = this.getActions(info, [ActionType.Planting], year);
    return plantingActions.length > 0 ? [].concat(...plantingActions.map((a: Action) => a.variety)).map((id: string) => info.varieties.find((v: Variety) => v.id === id)) : [];
  }

  getYears(info: Vineyard): number[] {
    return [...new Set(info.actions.map((a: Action) => (new Date(a.date).getFullYear())))];
  }

  getSeasons(): number[] {
    return [...new Set([].concat(...this._vineyards$.getValue().map((v: Vineyard) => this.getYears(v))))];
  }

  getFirstPlanting(info: Vineyard): Action {
    const plantingActions = this.getActions(info, [ActionType.Planting]);
    return plantingActions.length > 0 ? plantingActions[0] : undefined;
  }

  getLastPlanting(info: Vineyard): Action {
    const plantingActions = this.getActions(info, [ActionType.Planting]);
    return plantingActions.length > 0 ? plantingActions[plantingActions.length - 1] : undefined;
  }

   getActions(info: Vineyard, types: ActionType[] = [], maxYear: number = new Date().getFullYear()): Action[] {
    let actions = info ? info.actions : [];
    if (types.length > 0) {
      actions =  actions.filter((a: Action) => (types.indexOf(a.type) >= 0));
    }
    return actions.length > 0 ? actions.filter((a: Action) => new Date(a.date).getFullYear() <= maxYear) : actions;
   }

   getActionsInYears(info: Vineyard, types: ActionType[], years: number[]): Action[] {
    let actions = info ? info.actions : [];

    if (types.length > 0) {
      actions = actions.filter((a: Action) => (types.indexOf(a.type) >= 0));
    }
    return actions.length > 0 ? actions.filter((a: Action) => (years.indexOf(new Date(a.date).getFullYear()) >= 0)) : actions;
   }

  getPlantCount(info: Vineyard, season: number): number {
    const varities = this.getVarieties(info, season);
    return varities.length > 0 ? varities.map((v: Variety) => v.plantsPerRow * v.rows).reduce((sum: number, count: number, idx: number) => sum + count) : 0;
  }

  getLastUpdate(info: Vineyard): string {
    const action = info && info.actions.length > 0 ? info.actions[info.actions.length - 1] : undefined;
    return action ? action.date : undefined;
  }


  updateLocation(id: string, geometry: Polygon): void {
    const polygons = this._vineyards$.getValue().map((v: Vineyard) => v.id === id ? ({
      ...v,
      location: geometry
    }) : v);
    this._vineyards$.next(polygons);
  }

  saveVineyards(ids: string[]) {
    const geoJSON = new GeoJSON();
    this._vineyards$.getValue()
    .filter((v: Vineyard) => ids.indexOf(v.id) >= 0)
    .map((v: Vineyard) => ({
      ...v,
      location: new Polygon(v.location.getCoordinates()).transform('EPSG:3857', 'EPSG:4326')
    }))
    .map((v: Vineyard) => ({
      ...v,
      location: geoJSON.writeGeometry(v.location)
    })).forEach((d: VineyardDoc) => this._vineyardCollection.doc(d.id).set(d));
  }

  updateVineyard(vineyard: Vineyard): void {
    const vineyards: Vineyard[] = this._vineyards$.getValue().map((v: Vineyard) => v.id === vineyard.id ? vineyard : v);
    this._vineyards$.next(vineyards);
    this.saveVineyards([vineyard.id]);
  }

  getVariety(info: Vineyard, id: string): Variety {
    return info.varieties.find((v: Variety) => v.id === id);
  }

}
