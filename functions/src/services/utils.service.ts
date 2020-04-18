import {Vineyard} from '../models/vineyard.model';
import {Action} from '../models/action.model';

import * as admin from 'firebase-admin';
import * as turf from '@turf/turf';

admin.initializeApp();
export const db = admin.firestore();

export const getVineyard = (id: string): Promise<Vineyard> => {
    return new Promise<Vineyard>((resolve, reject) => {
        db.collection('vineyards').doc(id).get()
            .then((value) => {
                const data = value.data();
                if (!data) {
                    reject('No data defined');
                } else {
                    resolve ({
                        name: data.name,
                        address: data.address,
                        varieties: data.varieties,
                        location: JSON.parse(data.location),
                        actions: data.actions.sort((a1: Action, a2: Action) => (new Date(a1.date).getTime()) < (new Date(a2.date).getTime()) ? 1 : -1),
                        id: value.id,
                        meteo: data.meteo
                    });
                }

            })
            .catch((reason: any) => reject(reason));
    });
};

export const saveVineyard = (id: string, v:Vineyard): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        db.collection('vineyards').doc(id).set({
            ...v,
            location: JSON.stringify(v.location)
        })
            .then((value) => {
               resolve(true);
            })
            .catch((reason: any) => reject(reason));
    });
};

export const getVineyardLocation = (v: Vineyard): number[] => {
    const center = turf.center(turf.polygon(v.location.coordinates));
    return center.geometry ? center.geometry.coordinates : [];
}
