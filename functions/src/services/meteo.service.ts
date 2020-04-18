import {MeteoStats} from '../models/stats.model';
import * as moment from 'moment';
import * as https from 'https';
import {Vineyard} from '../models/vineyard.model';

export const API_KEY = 'fde78bde567300516c4e3cff1f929094';

export const getMeteo = (lat: number, lon: number, startdate: string, enddate: string): Promise<MeteoStats> => {
    return new Promise<MeteoStats>(((resolve, reject) => {
        console.log(`Retrieving meteo information for ${lat},${lon} from ${startdate} to ${enddate}`);
        const start = moment(startdate);
        const end = moment(enddate);
        const promisses: Promise<{date: string, temp: number, precip: number}> [] = [];

        for (const day = start; day.isSameOrBefore(end); day.add(1, 'days')) {
            promisses.push(getMeteoInfo(lat, lon, day.unix()))
        }
        Promise.all(promisses).then((data: {date: string, temp: number, precip: number}[]) => {
            resolve({
                data: data.sort((a, b) => a < b ? -1 : 1)
            })
        }).catch(error => reject(error));
    }));
}

export const getMeteoDates = (v: Vineyard) : { start: string, end: string} => {
    const stat = v.meteo;
    return {
        start: stat && stat.data ? stat.data[stat.data.length - 1].date : moment().year() + '0101',
        end:  moment().format('YYYYMMDD')
    }
}

const getMeteoInfo = (lat: number, lon: number, date: number): Promise<{date: string, temp: number, precip: number}> => {
    const options = {
        hostname: `api.darksky.net`,
        port: 443,
        path: `/forecast/${API_KEY}/${lat},${lon},${date}?exclude=currently,hourly,flags&units=auto`,
        method: 'GET'
    }
    return new Promise<{date: string, temp: number, precip: number}>((resolve, reject) => {
        let data = '';
       const req = https.request(options, res => {
            res.on('data', d => {
                data +=d
            });
            res.on('end', () => {
                const info = JSON.parse(data);

                resolve({
                    date: moment.unix(date).format('YYYYMMDD'),
                    temp: Math.round(((info.daily.data[0].temperatureMin + info.daily.data[0].temperatureMax) / 2) * 100) / 100,
                    precip: info.daily.data[0].precipIntensityMax
                });
            })

       });
       req.on('error', error => {
           reject(error);
       });
       req.end();
    });
}

export const updateMeteoStats = (v: Vineyard, meteo: MeteoStats): Vineyard => {
    const stat = v.meteo && v.meteo.data ? v.meteo : { data: [] };
    // If the stat already exists, replace existing and add new
    meteo.data.forEach((entry: {date: string, temp: number, precip: number}) => {
        const existing = stat!.data.find((sV) => sV.date === entry.date);
        if (existing) {
            // Replace the value if the date already exists
            existing.temp = entry.temp;
            existing.precip = entry.precip;
        } else {
            // Add the value when the date is new
            stat!.data.push(entry);
        }
    });
    v.meteo = stat;
    return v;
}
