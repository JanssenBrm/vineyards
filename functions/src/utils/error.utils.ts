import * as functions from 'firebase-functions';

export const sendError = (resp: functions.Response, code: number, message?: string) => {
  console.error(`Sending error`, code, message);
  resp.status(code);
  resp.json({
    error: message || '',
  });
};
