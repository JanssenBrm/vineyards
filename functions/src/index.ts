import * as functions from 'firebase-functions';
import {getVineyard, getVineyardLocation, saveVineyard} from './services/utils.service';
import {Vineyard} from './models/vineyard.model';
import {MeteoStats} from './models/stats.model';
import {getMeteo, getMeteoDates, updateMeteoStats} from './services/meteo.service';
import * as cors from 'cors';


const corsHandler = cors({origin: true});

exports.getVineyards = functions.https.onRequest(async(req, res) => {
    return corsHandler(req, res, () => {
        const userId = req.query.userId;
        if (!userId) {
            res.status(500).send({ error: 'no userid provided'});
        } else {
            res.status(200).send({ vineyards: []});
        }
    });
});

exports.updateTemp = functions.https.onRequest(async(req, res) => {
    return corsHandler(req, res, () => {
        const vineyardId = req.query.vineyardId;
        if (!vineyardId) {
            res.status(500).send({error: 'no vineyard id provided'});
        } else {
            ;
            getVineyard(vineyardId).then((v: Vineyard) => {
                let vineyard = v;
                const location = getVineyardLocation(v);
                const dates = getMeteoDates(v);
                console.log("Retrieving dates from " + dates.start + " to " + dates.end);
                getMeteo(location[1], location[0], dates.start, dates.end)
                    .then((stats: MeteoStats) => {
                        vineyard = updateMeteoStats(vineyard, stats);
                        saveVineyard(vineyardId, vineyard)
                            .then(() => res.status(200).send(vineyard))
                            .catch((error) => {
                                console.error(error);
                                res.status(500).send({error: 'Something went wrong when saving vineyard'})
                            })

                    })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send({error: 'Something went wrong when retrieving meteo stats'})
                    });
                ;
            }).catch((error) => {
                console.error(error);
                res.status(500).send({error: 'Something went wrong when lookup of vineyard'});
            });
        }
    });
});
