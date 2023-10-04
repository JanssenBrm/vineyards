import { BBCH_STAGES } from './../conf/bbch.config';
import { Vineyard } from './../models/vineyard.model';
import { Injectable } from '@angular/core';
import { buffer, createEmpty, extend, getArea } from 'ol/extent';
import Polygon from 'ol/geom/Polygon';
import { BBCH } from '../models/bbch.model';
import { Platform } from '@ionic/angular';
import * as marked from 'marked';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(public platform: Platform) {}

  getExtent(locations: Polygon[]): any {
    let extent = createEmpty();
    locations.forEach((p: Polygon) => {
      extent = extend(extent, p.getExtent());
    });
    return this.padExtent(extent);
  }

  padExtent(extent: any): any {
    const bufferDistance = Math.sqrt(getArea(extent)) / 2;
    return buffer(extent, bufferDistance);
  }

  reproject(v: Vineyard, from: string, to: string): Vineyard {
    return {
      ...v,
      location: new Polygon(v.location.coordinates).transform(from, to),
    };
  }

  getBBCHDescription(code: string): string {
    const stage: BBCH = BBCH_STAGES.find((s: BBCH) => +s.code === +code);
    return stage ? stage.description : '';
  }

  isMobile(): boolean {
    if (this.platform.is('ios') || this.platform.is('android')) {
      return true;
    } else {
      return false;
    }
  }

  static parseMarkdown(text: string): string {
    return marked.parse(text);
  }
}
