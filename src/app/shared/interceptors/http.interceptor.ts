import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.
    if (req.url.includes(environment.api)) {
      return this.auth.getToken().pipe(
        take(1),
        switchMap((token: string) => {
          const authReq = req.clone({
            headers: req.headers.set('Authorization', token),
          });
          return next.handle(authReq);
        })
      );
    }

    return next.handle(req);
  }
}
