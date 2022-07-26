import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserData, UserRole } from '../models/userdata.model';
import { Observable } from 'rxjs';
import { map, skipWhile, take, withLatestFrom } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  constructor(private authService: AuthService) {}

  isUserPremium(): Observable<boolean> {
    return this.getUserRole().pipe(
      withLatestFrom(this.isUserAdmin()),
      map(([role, isAdmin]) => role === UserRole.PREMIUM || isAdmin)
    );
  }

  isUserAdmin(): Observable<boolean> {
    return this.getUserRole().pipe(map((role: UserRole) => role === UserRole.ADMIN));
  }

  private getUserRole(): Observable<UserRole> {
    return this.authService.getUserData().pipe(
      skipWhile((data: UserData) => !data),
      take(1),
      map((data: UserData) => data.role)
    );
  }
}
