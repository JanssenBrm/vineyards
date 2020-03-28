import { HeaderComponent } from './components/header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { LastActionPipe } from './pipes/last-action.pipe';
import { ActiveTypePipe } from './pipes/active-type.pipe';



@NgModule({
  declarations: [
    HeaderComponent,
    ToolbarComponent,
    LastActionPipe,
    ActiveTypePipe
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
    ActiveTypePipe
  ]
})
export class SharedModule { }
