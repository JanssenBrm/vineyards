import { Component } from '@angular/core';
import { ROLES } from './config/features.config';

@Component({
  selector: 'app-premium',
  templateUrl: './premium.page.html',
  styleUrls: ['./premium.page.scss'],
})
export class PremiumPage {
  public readonly ROLES = ROLES;
}
