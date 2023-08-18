import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserData, UserRole } from '../../../models/userdata.model';
import { Observable } from 'rxjs';
import { ROLES } from '../../../premium/config/features.config';
import { ProductInfo } from '../../../premium/premium.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  public userData: Observable<UserData>;

  constructor(private authService: AuthService, public router: Router) {
    this.userData = this.authService.getUserData();
  }

  public getRoleLabel(role: UserRole): string {
    const match: ProductInfo = ROLES.find((r) => r.role === role);
    return match?.label || '';
  }
}
