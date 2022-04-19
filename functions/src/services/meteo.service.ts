import {MeteoStat, MeteoStats} from '../models/stats.model';
import * as moment from 'moment';
import axios from 'axios';
import {Action} from '../models/action.model';
import {dateInArray} from "./utils.service";

export const API_HOST = process.env.METEOSTAT_API_HOST;
export const API_KEY = process.env.METEOSTAT_API_KEY;

export const getMeteo = (lat: number, lon: number, start: moment.Moment, end: moment.Moment): Promise<MeteoStats> => {
    console.log(`Retrieving meteo information for ${lat},${lon} from ${start.toISOString()} to ${end.toISOString()}`);
    return getMeteoInfo(lat, lon, start, end);
};

export const getMeteoDates = (actions: Action[], stats: MeteoStats): { start: moment.Moment, end: moment.Moment }[] => {
    const dates = actions
        .map((a: Action) => moment(a.date))
        .sort((d1: moment.Moment, d2: moment.Moment) => d1.isSameOrBefore(d2) ? -1 : 1);
    const end: moment.Moment = moment();
    let current = moment(`${dates.length > 1 ? dates[0].year() : moment().year()}-01-01`);
    const statDates = stats.data.map((s: MeteoStat) => moment(s.date));

    if (statDates.length > 0) {
        const ranges = [];
        let currRange = undefined;
        while (current.diff(end) < 0) {
            const exists = dateInArray(current, statDates);
            if (!exists) {
                if (!currRange) {
                    currRange = {
                        start: moment(current.toISOString()),
                        end: moment(current.toISOString()),
                    }
                } else {
                    if (currRange.end.diff(current, 'days') > 1) {
                        ranges.push(currRange);
                        currRange = {
                            start: moment(current.toISOString()),
                            end: moment(current.toISOString()),
                        }
                    } else {
                        currRange.end = moment(current.toISOString())
                    }
                }
            }
            current = current.add(1, 'days')
        }
        if (currRange) {
            ranges.push(currRange);
        }
        return ranges;
    } else {
        return [{
            start: current,
            end
        }]
    }

};

const getMeteoInfo = async (lat: number, lon: number, start: moment.Moment, end: moment.Moment): Promise<MeteoStats> => {
    const options = {
        params: {
            lat,
            lon,
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD')
        },
        headers: {
            'x-rapidapi-host': API_HOST,
            'x-rapidapi-key': API_KEY
        }
    };
    const response = await axios.get('https://meteostat.p.rapidapi.com/point/daily', options);
    return response.data;
};
