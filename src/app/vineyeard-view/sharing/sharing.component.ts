import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Vineyard } from '../../models/vineyard.model';
import { VineyardService } from '../../services/vineyard.service';
import { SharedUserInfo } from '../../models/vineyarddoc.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-sharing',
  templateUrl: './sharing.component.html',
  styleUrls: ['./sharing.component.scss'],
})
export class SharingComponent implements OnChanges {
  @Input()
  vineyard: Vineyard;

  loading: boolean;

  permissions: SharedUserInfo[];

  constructor(private vineyardService: VineyardService) {}

  loadPermissions() {
    this.loading = true;
    this.vineyardService
      .getVineyardAccess(this.vineyard)
      .pipe(take(1))
      .subscribe({
        next: (permissions) => {
          this.permissions = permissions;
          this.loading = false;
        },
        error: (error) => {
          console.error('Could not load permissions', error);
          this.loading = false;
        },
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vineyard && this.vineyard) {
      this.loadPermissions();
    }
  }
}
