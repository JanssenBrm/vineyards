import { HeaderComponent } from './components/header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import {SidepanelComponent} from './components/sidepanel/sidepanel.component';



@NgModule({
  declarations: [
    HeaderComponent,
      SidepanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule
  ],
  exports: [
    HeaderComponent,
      SidepanelComponent
  ]
})
export class SharedModule { }
