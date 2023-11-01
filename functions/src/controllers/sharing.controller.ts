import * as functions from 'firebase-functions';
import { getSharedVineyards, isOwner, shareVineyard, unshareVineyard } from '../services/vineyards.service';
import { constants } from 'http2';
import { SharedVineyard } from '../models/vineyard.model';
import { authRequest } from '../utils/auth.middleware';
import { sendError } from '../utils/error.utils';

const handleRequest = async (req: functions.Request, resp: functions.Response, uid: string) => {
  try {
    const urlParts = req.path.split('/').filter((s) => s !== '');

    resp.set('Access-Control-Allow-Origin', '*');
    resp.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');

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
      case 'OPTIONS':
        resp.set('Access-Control-Allow-Headers', 'Authorization');
        resp.sendStatus(200);
        break;
      default:
        sendError(resp, constants.HTTP_STATUS_METHOD_NOT_ALLOWED);
    }
  } catch (err) {
    console.error('Could not process sharing request', err);
    // @ts-ignore
    sendError(resp, constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, `Sharing Error: ${err.message}`);
  }
};

export const sharingHooks = functions.https.onRequest((req: functions.Request, res: functions.Response) =>
  authRequest(req, res, handleRequest)
);
