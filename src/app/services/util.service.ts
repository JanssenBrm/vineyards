import { BBCH_STAGES } from './../conf/bbch.config';
import { Vineyard } from './../models/vineyard.model';
import { Injectable } from '@angular/core';
import { createEmpty, extend } from 'ol/extent';
import Polygon from 'ol/geom/Polygon';
import { BBCH } from '../models/bbch.model';
import {Platform} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor(
      public platform: Platform
  ) { }

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

  getBBCHDescription(code: string): string {
    const stage: BBCH = BBCH_STAGES.find((s: BBCH) => s.code === code);
    return stage ? stage.description : '';
  }

  isMobile(): boolean {
    if (this.platform.is('ios') || this.platform.is('android')) {
      return true;
    } else {
      return false;
    }
  }
}
