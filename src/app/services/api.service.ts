import { UtilService } from './util.service';
import { Vineyard } from './../models/vineyard.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor( private http: HttpClient, private utilService: UtilService) { }

  getVineyards(): Observable<Vineyard[]> {
    return this.http.get('./assets/mock/vineyards.json').pipe(
      map((data: Vineyard[]) => data.map((v: Vineyard) => this.utilService.reproject(v, 'EPSG:4326', 'EPSG:3857')))
    );
  }
}
