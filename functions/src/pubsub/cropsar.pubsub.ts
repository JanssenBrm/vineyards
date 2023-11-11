import * as functions from 'firebase-functions';
import { getPremiumUsers, getVineyard, getVineyardActions, getVineyards } from '../services/utils.service';
import { Vineyard } from '../models/vineyard.model';
import * as moment from 'moment/moment';
import { Action } from '../models/action.model';
import { executeGraphSync } from '../services/openeo.service';

const createGraph = (polygon: any, start: string, end: string) => {
  return {
    cropsar: {
      process_id: 'CropSAR',
      arguments: {
        biopar_type: 'ndvi',
        date: [start, end],
        polygon,
      },
      namespace: 'vito',
    },
    save: {
      process_id: 'save_result',
      arguments: {
        data: {
          from_node: 'cropsar',
        },
        format: 'JSON',
      },
      result: true,
    },
  };
};
const calculateCropSAR = async (polygon: any, start: string, end: string) => {
  try {
    console.log(`Calculating CropSAR for polgyon with start ${start} and end ${end}`);
    const graph = createGraph(polygon, start, end);
    const result = await executeGraphSync(graph, 'json');
    console.log(result);
  } catch (e) {
    console.error(`Could not calculate CropSAR`, e);
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
    return undefined;
  }
};

const calculateAllCropSAR = async () => {
  console.log('Starting calculation of CropSAR');

  const users: string[] = await getPremiumUsers();
  console.log(`Found ${users.length} users to process`);

  for (const uid of users) {
    const vineyards: string[] = await getVineyards(uid);
    console.log(`Found ${vineyards.length} vineyards for user ${uid}`);

    for (const id of vineyards) {
      try {
        const v: Vineyard = await getVineyard(uid, id);
        const actions = await getVineyardActions(uid, id);
        const dates = getCropSARDates(actions);

        if (dates) {
          await calculateCropSAR(v.location, dates[0], dates[1]);
        } else {
          console.warn(`No dates found for calculating CropSAR for vineyard ${v.id}`);
        }
      } catch (error) {
        console.error(`Error processing vineyard ${id} of ${uid}`, error);
      }
    }
  }
};

export const cropsarPubsub = functions.pubsub.schedule('0 1 * * *').onRun(async () => {
  return calculateAllCropSAR();
});
export const cropsarHook = functions.https.onRequest(async () => {
  return calculateAllCropSAR();
});
