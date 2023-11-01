import { auth } from './utils.service';
import * as functions from 'firebase-functions';

export const getUserId = async (req: functions.Request, res: functions.Response): Promise<string> => {
  try {
    const authorization = req.header('Authorization');
    if (authorization) {
      const user = await auth.verifyIdToken(authorization);
      return user.uid;
    } else {
      throw new Error('No Authorization header detected');
    }
  } catch (error) {
    console.error(`Could not get user ID from request`, error);
    return '';
  }
};
