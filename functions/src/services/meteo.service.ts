import {Stats} from '../models/stats.model';
import * as moment from 'moment';
import * as https from 'https';

export const API_KEY = 'fde78bde567300516c4e3cff1f929094';

export const getMeteo = (lat: number, lon: number, startdate: string, enddate: string): Promise<Stats[]> => {
    return new Promise<Stats[]>(((resolve, reject) => {
        console.log(`Retrieving meteo information for ${lat},${lon} from ${startdate} to ${enddate}`);
        const start = moment(startdate);
        const end = moment(enddate);
        const promisses: Promise<{date: string, value: number}> [] = [];

        for (const day = start; day.isSameOrBefore(end); day.add(1, 'days')) {
            promisses.push(getMeteoInfo(lat, lon, day.unix()))
        }
        Promise.all(promisses).then((data: {date: string, value: number}[]) => {
            resolve([{
                type: 'temperature',
                data: data.sort((a, b) => a < b ? -1 : 1)
            }])
        }).catch(error => reject(error));
    }));
}

const getMeteoInfo = (lat: number, lon: number, date: number): Promise<{date: string, value: number}> => {
    const options = {
        hostname: `api.darksky.net`,
        port: 443,
        path: `/forecast/${API_KEY}/${lat},${lon},${date}?exclude=currently,hourly,flags&units=auto`,
        method: 'GET'
    }
    return new Promise<{date: string, value: number}>((resolve, reject) => {
        let data = '';
       const req = https.request(options, res => {
            res.on('data', d => {
                data +=d
            });
            res.on('end', () => {
                const info = JSON.parse(data);

                resolve({
                    date: moment.unix(date).format('YYYYMMDD'),
                    value: Math.round(((info.daily.data[0].temperatureMin + info.daily.data[0].temperatureMax) / 2) * 100) / 100
                });
            })

       });
       req.on('error', error => {
           reject(error);
       });
       req.end();
    });
}
