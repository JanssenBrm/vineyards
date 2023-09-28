import { BBCH_STAGES } from './../conf/bbch.config';
import { Vineyard } from './../models/vineyard.model';
import { Injectable } from '@angular/core';
import { buffer, createEmpty, extend } from 'ol/extent';
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

  padExtent(extent: any, percentage = 1): any {
    console.log(extent);
    const longestSide = Math.max(
      ...[
        Math.abs(extent[0] - extent[1]),
        Math.abs(extent[1] - extent[2]),
        Math.abs(extent[2] - extent[3]),
        Math.abs(extent[3] - extent[0]),
      ]
    );
    const bufferDistance = longestSide * (percentage / 100);

    const buffered = buffer(extent, bufferDistance);
    console.log(extent, bufferDistance, buffered);
    return extent;
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
