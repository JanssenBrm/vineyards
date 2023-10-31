import * as functions from 'firebase-functions';
import { getSharedVineyards, isOwner, shareVineyard, unshareVineyard } from '../services/vineyards.service';
import { constants } from 'http2';
import { SharedVineyard } from '../models/vineyard.model';
import { getUserId } from '../services/security.service';

export const sharingHooks = functions.https.onRequest(async (req: functions.Request, resp: functions.Response) => {
  try {
    const urlParts = req.path.split('/').filter((s) => s !== '');
    const uid = await getUserId(req, resp);
    console.log(`Found uid ${uid}`);
    switch (req.method) {
      case 'GET':
        const vineyards: SharedVineyard[] = await getSharedVineyards(uid);
        resp.status(constants.HTTP_STATUS_OK);
        resp.send(vineyards);
        break;
      case 'POST':
        if (urlParts.length === 1) {
          const vineyardId = urlParts[0];
          if (await isOwner(uid, vineyardId)) {
            await shareVineyard(uid, vineyardId, req.body);
            resp.sendStatus(constants.HTTP_STATUS_OK);
          } else {
            resp.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
          }
        } else {
          resp.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        }
        break;
      case 'DELETE':
        if (urlParts.length === 2) {
          const vineyardId = urlParts[0];
          if (await isOwner(uid, vineyardId)) {
            await unshareVineyard(uid, urlParts[0], urlParts[1]);
            resp.sendStatus(constants.HTTP_STATUS_OK);
          } else {
            resp.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
          }
        } else {
          resp.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
        }
        break;
      default:
        resp.sendStatus(constants.HTTP_STATUS_METHOD_NOT_ALLOWED);
    }
  } catch (err) {
    console.error('Could not process sharing request', err);
    // @ts-ignore
    resp.status(500).send(`Sharing Error: ${err.message}`);
  }
});
