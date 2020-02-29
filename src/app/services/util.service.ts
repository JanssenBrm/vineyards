import { Vineyard } from './../models/vineyard.model';
import { Injectable } from '@angular/core';
import { createEmpty, extend } from 'ol/extent';
import Polygon from 'ol/geom/Polygon';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor() { }

  getExtent(locations: Polygon[]): any {
    let extent = createEmpty();
    locations.forEach((p: Polygon) => {
      extent = extend(extent, p.getExtent());
    });
    return extent;

  }

  reproject(v: Vineyard, from: string, to: string): Vineyard {
    return {
      ...v,
      location: new Polygon(v.location.coordinates).transform(from, to)
    };
  }
}
