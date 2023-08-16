import { db } from './utils.service';
import { UserRole } from '../models/userdata.model';
import * as admin from 'firebase-admin';
import WriteResult = admin.firestore.WriteResult;

export const updateUserRole = (uid: string, role: UserRole): Promise<WriteResult> => {
  return db.collection('users').doc(uid).update({ role });
};
