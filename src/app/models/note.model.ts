import {VintageStage} from './stage.model';

export interface Note {
    id: string;
    date: string;
    stage: VintageStage;
    description: string;
    files: string[];
}
