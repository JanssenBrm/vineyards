import { UtilService } from './util.service';
import { Vineyard } from './../models/vineyard.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _vineyards: BehaviorSubject<Vineyard[]>;

  constructor( private http: HttpClient, private utilService: UtilService) {
      this._vineyards = new BehaviorSubject<Vineyard[]>([]);
      this.readVineyards();
  }

  getVineyards(): Observable<Vineyard[]> {
    return this._vineyards;
  }

  private readVineyards(): void {
    this.http.get('./assets/mock/vineyards.json').pipe(
      map((data: Vineyard[]) => data.map((v: Vineyard) => this.utilService.reproject(v, 'EPSG:4326', 'EPSG:3857'))),
    ).subscribe((vineyards: Vineyard[]) => {
      this._vineyards.next(vineyards);
    });
  }
}
