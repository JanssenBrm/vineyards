import * as functions from 'firebase-functions';
import {
  getSharedVineyards,
  getVineyardPermissions,
  isOwner,
  shareVineyard,
  unshareVineyard,
} from '../services/vineyards.service';
import { constants } from 'http2';
import { SharedVineyard } from '../models/vineyard.model';
import { authRequest } from '../utils/auth.middleware';
import { sendError } from '../utils/error.utils';
import { corsRequest } from '../utils/cors.middleware';

const handleRequest = async (req: functions.Request, resp: functions.Response, uid: string) => {
  try {
    const urlParts = req.path.split('/').filter((s) => s !== '');

    switch (req.method) {
      case 'GET':
        if (urlParts.length === 0) {
          const vineyards: SharedVineyard[] = await getSharedVineyards(uid);
          resp.status(constants.HTTP_STATUS_OK);
          resp.send(vineyards);
        } else if (urlParts.length === 1) {
          const vineyardId = urlParts[0];
          if (await isOwner(uid, vineyardId)) {
            const permissions = await getVineyardPermissions(uid, vineyardId);
            resp.json(permissions);
            resp.sendStatus(200);
          } else {
            sendError(resp, constants.HTTP_STATUS_FORBIDDEN, 'Not the owner of the vineyard');
          }
        } else {
          sendError(resp, constants.HTTP_STATUS_NOT_FOUND);
        }
        break;
      case 'POST':
        if (urlParts.length === 1) {
          const vineyardId = urlParts[0];
          if (await isOwner(uid, vineyardId)) {
            await shareVineyard(uid, vineyardId, req.body);
            resp.sendStatus(constants.HTTP_STATUS_OK);
          } else {
            sendError(resp, constants.HTTP_STATUS_FORBIDDEN, 'Not the owner of the vineyard');
          }
        } else {
          sendError(resp, constants.HTTP_STATUS_NOT_FOUND);
        }
        break;
      case 'DELETE':
        if (urlParts.length === 2) {
          const vineyardId = urlParts[0];
          if (await isOwner(uid, vineyardId)) {
            await unshareVineyard(uid, urlParts[0], urlParts[1]);
            resp.sendStatus(constants.HTTP_STATUS_OK);
          } else {
            sendError(resp, constants.HTTP_STATUS_FORBIDDEN, 'Not the owner of the vineyard');
          }
        } else {
          sendError(resp, constants.HTTP_STATUS_NOT_FOUND);
        }
        break;
      default:
        sendError(resp, constants.HTTP_STATUS_METHOD_NOT_ALLOWED);
    }
  } catch (err) {
    console.error('Could not process sharing request', err);
    // @ts-ignore
    sendError(resp, constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, err.message);
  }
};

export const sharingHooks = functions.https.onRequest((req: functions.Request, res: functions.Response) =>
  corsRequest(req, res, (r, s) => authRequest(r, s, handleRequest))
);
