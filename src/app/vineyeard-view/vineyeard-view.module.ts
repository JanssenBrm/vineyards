import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { ActionsComponent } from './actions/actions.component';
import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VineyeardViewPageRoutingModule } from './vineyeard-view-routing.module';

import { VineyeardViewPage } from './vineyeard-view.page';
import { SharedModule } from '../shared/shared.module';
import { InfoComponent } from './info/info.component';
import { StatisticsComponent } from './statistics/statistics.component';

import * as Highcharts from 'highcharts';

declare var require: any;
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
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    VineyeardViewPageRoutingModule
  ],
  declarations: [
    VineyeardViewPage,
    InfoComponent,
    ActionsComponent,
    StatisticsComponent
  ],
  providers: [
    PhotoViewer,
    TitleCasePipe
  ]
})
export class VineyeardViewPageModule {}