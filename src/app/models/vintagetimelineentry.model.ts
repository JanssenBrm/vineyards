import { VintageEvent } from './vintageevent.model';
import * as moment from 'moment';

export interface VintageTimeLineEntry {
  stage: VintageEvent;
  start: moment.Moment;
  end: moment.Moment;
}
