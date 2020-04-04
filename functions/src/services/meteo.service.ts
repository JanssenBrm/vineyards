import {Meteo} from '../models/meteo.model';


export const getMeteo = (lat: number, lon: number, startdate: string, enddate: string): Meteo[] => {
    console.log(`Retrieving meteo information for ${lat},${lon} from ${startdate} to ${enddate}`)
    return [];
}
