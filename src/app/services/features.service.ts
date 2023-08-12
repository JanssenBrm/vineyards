import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PREMIUM_ROLES, UserData, UserRole } from '../models/userdata.model';
import { Observable } from 'rxjs';
import { map, skipWhile, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  constructor(private authService: AuthService) {}

  isUserPremium(): Observable<boolean> {
    return this.getUserRole().pipe(map((role) => PREMIUM_ROLES.includes(role)));
  }

  isUserAdmin(): Observable<boolean> {
    return this.getUserRole().pipe(map((role: UserRole) => role === UserRole.ADMIN));
  }

  getUserRole(): Observable<UserRole> {
    return this.authService.getUserData().pipe(
      skipWhile((data: UserData) => !data),
      take(1),
      map((data: UserData) => data.role)
    );
  }
}
