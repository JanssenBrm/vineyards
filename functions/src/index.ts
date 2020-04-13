import * as functions from 'firebase-functions';
import {getVineyard, getVineyardLocation} from './services/utils.service';
import {Vineyard} from './models/vineyard.model';
import {Stats} from './models/stats.model';
import {getMeteo} from './services/meteo.service';


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
            getMeteo(location[1], location[0], '20200101', '20200110')
                .then((stats: Stats[]) => {
                    res.status(200).send(stats);
                });
            ;//moment().format('YYYYMMDD'))
        }).catch((error) => {
            console.log(error);
            res.status(500).send({ error: 'Something went wrong when lookup of vineyard'});
        });
    }
});
