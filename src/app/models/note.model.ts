import {VintageStage} from './stage.model';

export interface Note {
    date: string;
    stage?: VintageStage;
    description: string;
}
