import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';

import { MapPage } from './map.page';
import { SharedModule } from '../shared/shared.module';
import { AddVineyardComponent } from './addvineyard/addvineyard.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SharedModule, MapPageRoutingModule, ReactiveFormsModule],
  declarations: [MapPage, AddVineyardComponent],
})
export class MapPageModule {}
