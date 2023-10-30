import * as functions from 'firebase-functions';
import { shareVineyard, unshareVineyard } from '../services/vineyards.service';
import { getUserId } from '../services/security.service';

export const sharingHooks = functions.https.onRequest(async (req: functions.Request, resp: functions.Response) => {
  try {
    const urlParts = req.path.split('/').filter((s) => s !== '');
    const uid = await getUserId(req, resp);
    console.log(`Found uid ${uid}`);
    switch (req.method) {
      case 'POST':
        if (urlParts.length === 2) {
          await shareVineyard(urlParts[0], urlParts[1], req.body);
          resp.sendStatus(200);
        } else {
          resp.sendStatus(404);
        }
        break;
      case 'DELETE':
        if (urlParts.length === 3) {
          await unshareVineyard(urlParts[0], urlParts[1], urlParts[2]);
          resp.sendStatus(200);
        } else {
          resp.sendStatus(404);
        }
        break;
      default:
        resp.sendStatus(405);
    }
  } catch (err) {
    console.error('Could not process sharing request', err);
    // @ts-ignore
    resp.status(500).send(`Sharing Error: ${err.message}`);
  }
});
