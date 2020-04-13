import {Moment} from 'moment';

export interface Stats{
    type: string;
    data: {date: Moment, value: number}[];
}
