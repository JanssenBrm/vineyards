import { db } from './utils.service';
import { UserRole } from '../models/userdata.model';
import * as admin from 'firebase-admin';
import WriteResult = admin.firestore.WriteResult;

export const updateUserRole = (uid: string, role: UserRole): Promise<WriteResult> => {
  return db
    .collection('users')
    .doc(uid)
    .update({ role: +role });
};

export const getUsername = async (uid: string): Promise<string> => {
  try {
    console.log(`Looking username for ${uid}`);
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      return doc.data()?.name || '';
    } else {
      throw new Error(`Could not find user ${uid}`);
    }
  } catch (error) {
    console.error(`Could not retrieve username for ${uid}`, error);
    throw error;
  }
};
