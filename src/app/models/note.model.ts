import {VintageEvent} from './vintageevent.model';

export interface Note {
    id: string;
    date: string;
    stage: VintageEvent;
    description: string;
    files: string[];
}
