import {MeteoStats} from '../models/stats.model';
import * as moment from 'moment';
import axios from 'axios';
import {Action} from '../models/action.model';

export const API_HOST = process.env.METEOSTAT_API_HOST;
export const API_KEY = process.env.METEOSTAT_API_KEY;

export const getMeteo = (lat: number, lon: number, start: moment.Moment, end: moment.Moment): Promise<MeteoStats> => {
    console.log(`Retrieving meteo information for ${lat},${lon} from ${start.toISOString()} to ${end.toISOString()}`);
    return getMeteoInfo(lat, lon, start, end);
};

export const getMeteoDates = (actions: Action[]): { start: moment.Moment, end: moment.Moment } => {
    const dates = actions
        .map((a: Action) => moment(a.date))
        .sort((d1: moment.Moment, d2: moment.Moment) => d1.isSameOrBefore(d2) ? -1 : 1);
    return {
        start: moment(`${dates.length > 1 ? dates[0].year() : moment().year()}-01-01`),
        end: moment()
    };
};

const getMeteoInfo = async (lat: number, lon: number, start: moment.Moment, end: moment.Moment): Promise<MeteoStats> => {
    var options = {
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
