import * as functions from 'firebase-functions';
import {getUsers, getVineyard, getVineyardActions, getVineyardLocation, getVineyards, saveMeteo} from './services/utils.service';
import {Vineyard} from './models/vineyard.model';
import {getMeteo, getMeteoDates} from './services/meteo.service';


//exports.updateMeteoStatsHttp = functions.https.onRequest(async (req, res) => _updateMeteoStats());
exports.updateMeteoStats = functions.pubsub.schedule('0 0 * * *').onRun(async (context) => _updateMeteoStats());

const _updateMeteoStats = async () => {
    const users: string[] = await getUsers();
    console.log(`Found ${users.length} users to process`);
    return users.map(async (uid: string) => {
        const vineyards: string[] = await getVineyards(uid);
        console.log(`Found ${vineyards.length} vineyards for user ${uid}`);
        return vineyards.map(async (id: string) => {
            try {
                const v: Vineyard = await getVineyard(uid, id);
                const location = getVineyardLocation(v);
                const actions = await getVineyardActions(uid, id);
                const dates = getMeteoDates(actions);
                console.log('Retrieving dates from ' + dates.start + ' to ' + dates.end);
                const stats = await getMeteo(location[1], location[0], dates.start, dates.end);
                return await saveMeteo(uid, id, stats);
            } catch (error) {
                console.error(`Error processing vineyard ${id} of ${uid}`, error);
                return undefined;
            }
        });
    });
};
