import {Vineyard} from '../models/vineyard.model';

import * as admin from 'firebase-admin';
import * as turf from '@turf/turf';
import {MeteoStats} from '../models/stats.model';
import WriteResult = admin.firestore.WriteResult;
import {Action} from '../models/action.model';
import UserRecord = admin.auth.UserRecord;

admin.initializeApp();
export const db = admin.firestore();
export const auth = admin.auth();


export const getUsers = (): Promise<string[]> => {
    return db.collection('users').listDocuments()
        .then((docs) =>
            docs.map((doc) => doc.id));
};

export const getUserEmail = (uid: string): Promise<string | undefined> => {
    return auth.getUser(uid)
        .then((record: UserRecord) => record.email)
}

export const getVineyards = (uid: string): Promise<string[]> => {
    return db.collection('users').doc(uid).collection('vineyards').listDocuments()
        .then((vdocs) => vdocs.map((vdoc) => vdoc.id));
};

export const getVineyard = (uid: string, id: string): Promise<Vineyard> => {
    return new Promise<Vineyard>((resolve, reject) => {
        db.collection('users').doc(uid).collection('vineyards').doc(id).get()
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
    return db.collection('users').doc(uid).collection('vineyards').doc(id).collection('actions').listDocuments()
        .then((docs) =>
            Promise.all(docs.map((doc) => doc.get()))
        )
        .then((docs) => docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }) as Action))
        .catch(() => []);
};


export const saveMeteo = (uid: string, id: string, stats: MeteoStats): Promise<WriteResult> => {
    return db.collection('users').doc(uid)
        .collection('vineyards')
        .doc(id)
        .collection('stats')
        .doc('meteo')
        .set(stats)
};

export const getVineyardLocation = (v: Vineyard): number[] => {
    const center = turf.center(turf.polygon(v.location.coordinates));
    return center.geometry ? center.geometry.coordinates : [];
};
