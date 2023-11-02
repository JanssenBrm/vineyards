import { AddActionComponent } from './add-action/add-action.component';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { ActionsComponent } from './actions/actions.component';
import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VineyardViewPageRoutingModule } from './vineyard-view-routing.module';

import { VineyardViewPage } from './vineyard-view-page.component';
import { SharedModule } from '../shared/shared.module';
import { InfoComponent } from './info/info.component';
import { StatisticsComponent } from './statistics/statistics.component';

import * as Highcharts from 'highcharts';
import { VintagesComponent } from './vintages/vintages.component';
import { AddVintageComponent } from './add-vintage/add-vintage.component';
import { AddNoteComponent } from './add-note/add-note.component';
import { UploadService } from '../services/upload.service';
import { NotesComponent } from './notes/notes.component';
import { TimelineComponent } from './timeline/timeline.component';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { NoteTypesPipe } from '../pipes/note-types.pipe';
import { FilterNotesByTypesPipe } from '../pipes/filter-notes-by-types.pipe';
import { FilterVarietiesBySeasonPipe } from '../pipes/filter-varieties-by-season.pipe';
import { FilterActionsByTypesPipe } from '../pipes/filter-actions-by-types.pipe';
import { WeatherComponent } from './weather/weather.component';
import { WarningsComponent } from './warnings/warnings.component';
import { MenuComponent } from './menu/menu.component';
import { FilterActionsByVarietiesPipe } from '../pipes/filter-actions-by-varieties.pipe';
import { NotebookComponent } from './notebook/notebook.component';
import { AddNoteNotebookComponent } from './add-note-notebook/add-note-notebook.component';
import { FilterNotesByFilterPipe } from '../pipes/filter-notes-by-filter.pipe';
import { BbchComponent } from './bbch/bbch.component';
import { SeasonsComponent } from './seasons/seasons.component';
import { SharingComponent } from './sharing/sharing.component';

declare const require: any;
const Boost = require('highcharts/modules/boost');
const noData = require('highcharts/modules/no-data-to-display');
const More = require('highcharts/highcharts-more');
const Timeline = require('highcharts/modules/timeline');
const theme = require('highcharts/themes/dark-unica');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
Timeline(Highcharts);
noData(Highcharts);
theme(Highcharts);

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, SharedModule, VineyardViewPageRoutingModule],
  declarations: [
    VineyardViewPage,
    InfoComponent,
    ActionsComponent,
    StatisticsComponent,
    AddActionComponent,
    AddVintageComponent,
    VintagesComponent,
    AddNoteComponent,
    NotesComponent,
    TimelineComponent,
    OrderByPipe,
    NoteTypesPipe,
    FilterNotesByTypesPipe,
    FilterVarietiesBySeasonPipe,
    FilterActionsByTypesPipe,
    FilterActionsByVarietiesPipe,
    WeatherComponent,
    WarningsComponent,
    MenuComponent,
    NotebookComponent,
    AddNoteNotebookComponent,
    FilterNotesByFilterPipe,
    BbchComponent,
    SeasonsComponent,
    SharingComponent,
  ],
  providers: [PhotoViewer, TitleCasePipe, UploadService, FilterNotesByFilterPipe],
  exports: [MenuComponent],
})
export class VineyardViewPageModule {}
