import {VintageStage} from './stage.model';
import * as moment from 'moment';

export interface VinetageTimeLineEntry {
    stage: VintageStage;
    start: moment.Moment;
    end: moment.Moment;
};
