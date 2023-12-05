import * as functions from 'firebase-functions';
import { getPremiumUsers, getVineyard, getVineyardActions, getVineyards } from '../services/utils.service';
import { Vineyard } from '../models/vineyard.model';
import * as moment from 'moment/moment';
import { Action } from '../models/action.model';
import { executeGraphSync } from '../services/openeo.service';
import { area, buffer } from '@turf/turf';
import { CropSARStat } from '../models/stats.model';
import { saveCropSAR } from '../services/vineyards.service';
import { logger } from '../utils/logger.util';

const createV1Graph = (polygon: any, start: string, end: string, biopar = 'FAPAR') => {
  let finalPolygon = polygon;
  if (area(finalPolygon) < 100) {
    // Buffer the polygon with 10m as CropSAR does a buffer of -10m
    finalPolygon = buffer(polygon, 30, { units: 'meters' }).geometry;
  }
  const now = moment().add(-1, 'day');
  const finalEnd = moment(end).isAfter(now) ? now.format('YYYY-MM-DD') : end;
  return {
    cropsar: {
      process_id: 'CropSAR',
      arguments: {
        biopar_type: biopar,
        date: [start, finalEnd],
        polygon: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: finalPolygon,
            },
          ],
        },
      },
      namespace: 'vito',
      result: true,
    },
  };
};
const calculateCropSAR = async (polygon: any, start: string, end: string): Promise<CropSARStat[]> => {
  try {
    logger.info(`Calculating CropSAR for polgyon with start ${start} and end ${end}`);
    const graph = createV1Graph(polygon, start, end);
    const results = await executeGraphSync(graph, 'json');
    const keys = Object.keys(results);
    if (keys.length > 0) {
      const result = results[keys[0]];
      return Object.keys(result).map((date) => ({
        date,
        value: result[date],
      }));
    } else {
      return [];
    }
  } catch (e) {
    logger.error(`Could not calculate CropSAR`, e);
    return [];
  }
};
export const getCropSARDates = (actions: Action[]): [string, string] | undefined => {
  const dates = actions
    .map((a: Action) => moment(a.date).year())
    .filter((year: number, index: number, years: number[]) => years.indexOf(year) === index)
    .sort();
  if (dates.length > 0) {
    return [`${dates[0]}-01-01`, `${dates[dates.length - 1]}-12-31`];
  } else {
    const now = moment().year();
    return [`${now}-01-01`, `${now}-12-31`];
  }
};

export const calculateAllCropSAR = async () => {
  logger.debug('Starting calculation of CropSAR');

  const users: string[] = await getPremiumUsers();
  logger.debug(`Found ${users.length} users to process`);

  for (const uid of users) {
    const vineyards: string[] = await getVineyards(uid);
    logger.debug(`Found ${vineyards.length} vineyards for user ${uid}`);

    for (const id of vineyards) {
      try {
        const v: Vineyard = await getVineyard(uid, id);
        const actions = await getVineyardActions(uid, id);
        const dates = getCropSARDates(actions);

        if (dates) {
          const result = await calculateCropSAR(v.location, dates[0], dates[1]);
          await saveCropSAR(uid, id, result);
        } else {
          logger.warn(`No dates found for calculating CropSAR for vineyard ${v.id}`);
        }
      } catch (error) {
        logger.error(`Error processing vineyard ${id} of ${uid}`, error);
      }
    }
  }
};

export const cropsarService = functions
  .runWith({
    timeoutSeconds: 540,
  })
  .pubsub.schedule('0 1 * * *')
  .onRun(async () => {
    return calculateAllCropSAR();
  });
export const cropsarHook = functions
  .runWith({
    timeoutSeconds: 540,
  })
  .https.onRequest(async () => {
    return calculateAllCropSAR();
  });
