import * as functions from 'firebase-functions';

export const corsRequest = async (
  req: functions.Request,
  res: functions.Response,
  handler: (req: functions.Request, res: functions.Response) => void
) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Headers', 'Authorization');
    res.sendStatus(200);
  } else {
    handler(req, res);
  }
};
