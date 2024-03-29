import { HeaderComponent } from './components/header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { LastActionPipe } from './pipes/last-action.pipe';
import { ActiveTypePipe } from './pipes/active-type.pipe';
import { HideOnPlatformDirective } from './directives/hide-on-platform.directive';
import { FilterActionsBySeasonPipe } from '../pipes/filter-actions-by-season.pipe';
import { UsermenuComponent } from './components/usermenu/usermenu.component';
import { LayersComponent } from './components/toolbar/layers/layers.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { UserbuttonComponent } from './components/userbutton/userbutton.component';
import { MomentPipe } from '../pipes/moment.pipe';
import { HasRoleDirective } from './directives/has-role.directive';
import { HasPermissionsDirective } from './directives/has-permissions.directive';

@NgModule({
  declarations: [
    HeaderComponent,
    UsermenuComponent,
    ToolbarComponent,
    LastActionPipe,
    ActiveTypePipe,
    HideOnPlatformDirective,
    FilterActionsBySeasonPipe,
    LayersComponent,
    ConfirmComponent,
    UserbuttonComponent,
    MomentPipe,
    HasRoleDirective,
    HasPermissionsDirective,
  ],
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule],
  exports: [
    HeaderComponent,
    UsermenuComponent,
    ToolbarComponent,
    LastActionPipe,
    ActiveTypePipe,
    HideOnPlatformDirective,
    FilterActionsBySeasonPipe,
    LayersComponent,
    ConfirmComponent,
    UserbuttonComponent,
    MomentPipe,
    HasRoleDirective,
    HasPermissionsDirective,
  ],
})
export class SharedModule {}
