import { BBCH_STAGES } from './../conf/bbch.config';
import { Injectable } from '@angular/core';
import { Polygon } from 'geojson';
import { BBCH } from '../models/bbch.model';
import { Platform } from '@ionic/angular';
import * as marked from 'marked';
import buffer from '@turf/buffer';
import union from '@turf/union';
import bboxPolygon from '@turf/bbox-polygon';
import bbox from '@turf/bbox';
import area from '@turf/area';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(public platform: Platform) {}

  getExtent(locations: Polygon[]): any {
    let extent = undefined;
    locations.forEach((p: Polygon) => {
      if (!extent) {
        extent = bboxPolygon(bbox(p));
      } else {
        extent = union(extent, p);
      }
    });
    return this.padExtent(extent);
  }

  padExtent(extent: Polygon): any {
    const bufferDistance = Math.sqrt(area(extent)) / 30;
    return bbox(buffer(bboxPolygon(bbox(extent)), bufferDistance, { units: 'kilometers' }));
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
