import { Vineyard } from '../models/vineyard.model';

import * as admin from 'firebase-admin';
import * as turf from '@turf/turf';
import { MeteoStats } from '../models/stats.model';
import { Action } from '../models/action.model';
import * as moment from 'moment';
import { UserRole } from '../models/userdata.model';
import WriteResult = admin.firestore.WriteResult;

admin.initializeApp();
export const db = admin.firestore();
export const auth = admin.auth();

export const getUsers = (): Promise<string[]> => {
  return db
    .collection('users')
    .listDocuments()
    .then((docs) => docs.map((doc) => doc.id));
};

export const getPremiumUsers = async (): Promise<string[]> => {
  const users: string[] = await getUsers();
  const premium: { uid: string; premium: boolean }[] = await Promise.all(
    users.map((uid) =>
      isUserPremium(uid).then((p: boolean) => ({
        uid,
        premium: p,
      }))
    )
  );
  return premium.filter((uid) => uid.premium).map((uid) => uid.uid);
};
export const isUserPremium = (uid: string): Promise<boolean> => {
  return db
    .collection('users')
    .doc(uid)
    .get()
    .then((doc) =>
      doc.exists ? [UserRole.PREMIUM, UserRole.ADMIN].includes(doc.data()?.role || UserRole.BASIC) : false
    )
    .catch((error) => {
      console.error(`Could not detect if user ${uid} is premium`, error);
      return false;
    });
};

export const getVineyards = (uid: string): Promise<string[]> => {
  return db
    .collection('users')
    .doc(uid)
    .collection('vineyards')
    .listDocuments()
    .then((vdocs) => vdocs.map((vdoc) => vdoc.id));
};

export const getVineyard = (uid: string, id: string): Promise<Vineyard> => {
  return new Promise<Vineyard>((resolve, reject) => {
    db.collection('users')
      .doc(uid)
      .collection('vineyards')
      .doc(id)
      .get()
      .then((value) => {
        const data = value.data();
        if (!data) {
          reject('No data defined');
        } else {
          resolve({
            name: data.name,
            address: data.address,
            location: JSON.parse(data.location),
            id: value.id,
          });
        }
      })
      .catch((reason: any) => reject(reason));
  });
};

export const getVineyardActions = (uid: string, id: string): Promise<Action[]> => {
  return db
    .collection('users')
    .doc(uid)
    .collection('vineyards')
    .doc(id)
    .collection('actions')
    .listDocuments()
    .then((docs) => Promise.all(docs.map((doc) => doc.get())))
    .then((docs) =>
      docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Action)
      )
    )
    .catch(() => []);
};

export const getVineyardStats = (uid: string, id: string): Promise<MeteoStats> => {
  return db
    .collection('users')
    .doc(uid)
    .collection('vineyards')
    .doc(id)
    .collection('stats')
    .doc('meteo')
    .get()
    .then((doc) => (doc.data() as MeteoStats) || { data: [] })
    .catch(() => ({
      data: [],
    }));
};

export const saveMeteo = (uid: string, id: string, stats: MeteoStats): Promise<WriteResult> => {
  return db.collection('users').doc(uid).collection('vineyards').doc(id).collection('stats').doc('meteo').set(stats);
};

export const getVineyardLocation = (v: Vineyard): number[] => {
  const center = turf.center(turf.polygon(v.location.coordinates));
  return center.geometry ? center.geometry.coordinates : [];
};

export const dateInArray = (date: moment.Moment, dates: moment.Moment[]): boolean =>
  !!dates.find((d: moment.Moment) => d.isSame(date, 'day'));
