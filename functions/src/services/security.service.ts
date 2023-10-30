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
    res.status(401).json({ error: 'Unauthorized' });
    return '';
  }
};
