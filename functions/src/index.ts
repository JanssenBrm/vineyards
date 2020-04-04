import * as functions from 'firebase-functions';
import {getVineyard, getVineyardLocation} from './services/utils.service';
import {Vineyard} from './models/vineyard.model';


exports.getVineyards = functions.https.onRequest(async(req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        res.status(500).send({ error: 'no userid provided'});
    } else {
        res.status(200).send({ vineyards: []});
    }
});

exports.updateTemp = functions.https.onRequest(async(req, res) => {
    const vineyardId = req.query.vineyardId;
    if (!vineyardId) {
        res.status(500).send({ error: 'no vineyard id provided'});
    } else {
        getVineyard(vineyardId).then((v: Vineyard) => {
            const location = getVineyardLocation(v);
            res.status(200).send({ vineyards: location});
        }).catch((error) => {
            console.log(error);
            res.status(500).send({ error: 'Something went wrong when lookup of vineyard'});
        });
    }
});
