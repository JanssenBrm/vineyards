import * as functions from 'firebase-functions';
import { sendError } from './error.utils';
import { constants } from 'http2';
import { getUserId } from '../services/security.service';

export const authRequest = async (
  req: functions.Request,
  res: functions.Response,
  handler: (req: functions.Request, res: functions.Response, userId: string) => void
) => {
  const uid = await getUserId(req, res);
  if (!uid && req.method !== 'OPTIONS') {
    sendError(res, constants.HTTP_STATUS_UNAUTHORIZED);
  } else {
    handler(req, res, uid);
  }
};
