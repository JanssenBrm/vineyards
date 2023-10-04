import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { Vineyard, VineyardPermissions } from '../../models/vineyard.model';
import { VineyardService } from '../../services/vineyard.service';
import { map, skipWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HasPermissionsGuard implements CanActivate {
  private routes = [
    {
      tab: 'notes',
      permissions: VineyardPermissions.OWNER,
    },
  ];

  constructor(private vineyardService: VineyardService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.vineyardService.getVineyardsListener().pipe(
      skipWhile((vineyards: Vineyard[]) => vineyards?.length == 0),
      map((vineyards: Vineyard[]) => {
        const activeVineyard = vineyards.find((v: Vineyard) => v.id === route.params.id);
        return activeVineyard.permissions >= this.getRoutePermissions(route);
      })
    );
  }

  private getRoutePermissions(route: ActivatedRouteSnapshot): VineyardPermissions {
    return this.routes.find((r) => r.tab === route.params.tab)?.permissions || VineyardPermissions.NONE;
  }
}
