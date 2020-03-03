import { Variety } from './../models/variety.model';
import { Season } from './../models/season.model';
import { UtilService } from './util.service';
import { Vineyard } from './../models/vineyard.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';
import { Action } from '../models/action.model';

@Injectable({
  providedIn: 'root'
})
export class VineyardService {

  private _vineyards: BehaviorSubject<Vineyard[]>;
  private _activeVineyard: BehaviorSubject<Vineyard>;

  constructor( private http: HttpClient, private utilService: UtilService) {
      this._vineyards = new BehaviorSubject<Vineyard[]>([]);
      this._activeVineyard = new BehaviorSubject<Vineyard>(null);
      this.readVineyards();
  }

  getVineyards(): Observable<Vineyard[]> {
    return this._vineyards;
  }

  setActiveVineyard(id: string): void {
    this._activeVineyard.next(id ? this._vineyards.getValue().find((v: Vineyard) => v.id === id) : null);
  }

  getActiveVineyard(): Observable<Vineyard> {
    return this._activeVineyard;
  }

  private readVineyards(): void {
    this.http.get('./assets/mock/vineyards.json').pipe(
      map((data: Vineyard[]) => data.map((v: Vineyard) => this.utilService.reproject(v, 'EPSG:4326', 'EPSG:3857'))),
    ).subscribe((vineyards: Vineyard[]) => {
      this._vineyards.next(vineyards);
    });
  }

  getInfo(id: string): Vineyard {
    return this._vineyards.getValue().find((v: Vineyard) => v.id === id);
  }

  getLatestVarieties(info: Vineyard): Variety[] {
    const plantingActions = this.getLastPlanting(info);
    return plantingActions ?  plantingActions.varieties : [];
  }

  getVarieties(info: Vineyard, year: number): Variety[] {
    const plantingActions = this.getPlantingActions(info, year);
    return plantingActions.length > 0 ? [].concat(...plantingActions.map((a: Action) => a.varieties)) : [];
  }

  getYears(info: Vineyard): number[] {
    const currYear = (new Date()).getFullYear();
    const plantAction = this.getFirstPlanting(info);
    const startYear = plantAction ? new Date(plantAction.date).getFullYear() : currYear;
    return [... new Array(currYear - startYear + 1).fill(1)].map((val: number, idx: number) => startYear + idx);
  }

  getSeasons(): number[] {
    return [...new Set([].concat(...this._vineyards.getValue().map((v: Vineyard) => this.getYears(v))))];
  }

  getFirstPlanting(info: Vineyard): Action {
    const plantingActions = this.getPlantingActions(info);
    return plantingActions.length > 0 ? plantingActions[0] : undefined;
  }

  getLastPlanting(info: Vineyard): Action {
    const plantingActions = this.getPlantingActions(info);
    return plantingActions.length > 0 ? plantingActions[plantingActions.length - 1] : undefined;
  }

  getPlantingActions(info: Vineyard, year?: number): Action[] {
   const actions = info ? info.actions.filter((a: Action) => a.type === 'planting') : [];
   return year && actions.length > 0 ? actions.filter((a: Action) => (new Date(a.date).getFullYear() <= year)) : actions;
  }

  getPlantCount(info: Vineyard, season: number): number {
    const varities = season
      ? this.getVarieties(info, season)
      : this.getLatestVarieties(info);
    return varities.length > 0 ? varities.map((v: Variety) => v.platsPerRow * v.rows).reduce((sum: number, count: number, idx: number) => sum + count) : 0;
  }

  getLastUpdate(info: Vineyard): string {
    const action = info && info.actions.length > 0 ? info.actions[info.actions.length - 1] : undefined;
    return action ? action.date : undefined;
  }

}
