import * as functions from 'firebase-functions';
import {getMissingStats, getVineyard, getVineyardLocation} from './services/utils.service';
import {Vineyard} from './models/vineyard.model';
import {Stats} from './models/stats.model';
import {getMeteo} from './services/meteo.service';
import * as moment from 'moment';

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
            const startdate = moment('20200101');//moment(`${moment().year}0101`);
            const enddate = moment('20200110'); //moment().add(7, 'days');
            let tempStat = v.stats.find(s => s.type === 'temperature');
            if (!tempStat) {
                tempStat = { type: 'temperature', data: []};
            }

            const missing = getMissingStats(tempStat, startdate, enddate);

            res.status(200).send(missing);
            getMeteo('temperature', location[1], location[0], missing)
                .then((stats: Stats[]) => {
                    const newStats = stats.find(s => s.type === 'temperature')
                    if (newStats) {
                        tempStat!.data = tempStat!.data.concat(...newStats.data);
                    }
                    res.status(200).send(v);
                });
            ;//moment().format('YYYYMMDD'))*/
        }).catch((error) => {
            console.log(error);
            res.status(500).send({ error: 'Something went wrong when lookup of vineyard'});
        });
    }
});
