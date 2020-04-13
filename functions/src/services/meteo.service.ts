import {Stats} from '../models/stats.model';
import * as moment from 'moment';
import * as https from 'https';
import {Moment} from 'moment';

export const API_KEY = 'fde78bde567300516c4e3cff1f929094';

export const getMeteo = (type: string, lat: number, lon: number, dates: Moment[]): Promise<Stats[]> => {
    return new Promise<Stats[]>(((resolve, reject) => {
        Promise.all(dates.map((d: Moment) => getMeteoInfo(lat, lon, d.unix()))).then((data: {date: Moment, value: number}[]) => {
            resolve([{
                type: type,
                data: data.sort((a, b) => a < b ? -1 : 1)
            }])
        }).catch(error => reject(error));
    }));
}

const getMeteoInfo = (lat: number, lon: number, date: number): Promise<{date: Moment, value: number}> => {
    const options = {
        hostname: `api.darksky.net`,
        port: 443,
        path: `/forecast/${API_KEY}/${lat},${lon},${date}?exclude=currently,hourly,flags&units=auto`,
        method: 'GET'
    }
    return new Promise<{date: Moment, value: number}>((resolve, reject) => {
        let data = '';
       const req = https.request(options, res => {
            res.on('data', d => {
                data +=d
            });
            res.on('end', () => {
                const info = JSON.parse(data);
                resolve({
                    date: moment.unix(date),
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
