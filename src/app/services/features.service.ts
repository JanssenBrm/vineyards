import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PREMIUM_ROLES, UserData, UserRole } from '../models/userdata.model';
import { combineLatest, Observable } from 'rxjs';
import { map, skipWhile, switchMap, take } from 'rxjs/operators';
import { User } from 'firebase';

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
      map((data: UserData) => data.role)
    );
  }

  updateUserRole(role: UserRole): Observable<UserData> {
    return combineLatest(this.authService.getUser(), this.authService.getUserData()).pipe(
      take(1),
      switchMap(([user, userData]: [User, UserData]) =>
        this.authService
          .updateUser(user, {
            ...userData,
            role,
          })
          .pipe(switchMap(() => this.authService.readUserData(user)))
      )
    );
  }
}
