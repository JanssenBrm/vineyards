import { HeaderComponent } from './components/header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { LastActionPipe } from './pipes/last-action.pipe';
import { ActiveTypePipe } from './pipes/active-type.pipe';
import {HideOnPlatformDirective} from '../directives/hide-on-platform.directive';
import {FilterActionsBySeasonPipe} from '../pipes/filter-actions-by-season.pipe';



@NgModule({
  declarations: [
    HeaderComponent,
    ToolbarComponent,
    LastActionPipe,
    ActiveTypePipe,
    HideOnPlatformDirective,
      FilterActionsBySeasonPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule
  ],
  exports: [
    HeaderComponent,
    ToolbarComponent,
    LastActionPipe,
    ActiveTypePipe,
    HideOnPlatformDirective,
    FilterActionsBySeasonPipe
  ]
})
export class SharedModule { }
