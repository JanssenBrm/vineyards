import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeaturesService } from '../../services/features.service';
import { UserRole } from '../../models/userdata.model';

@Directive({
  selector: '[appUserHasRole]',
})
export class HasRoleDirective {
  constructor(private featureService: FeaturesService, private vcr: ViewContainerRef, private tpl: TemplateRef<any>) {}

  @Input() set appUserHasRole(roles: UserRole[]) {
    this.featureService.getUserRole().subscribe({
      next: (role: UserRole) => {
        if (roles.includes(role)) {
          this.vcr.createEmbeddedView(this.tpl);
        } else {
          this.vcr.clear();
        }
      },
      error: (error: any) => {
        console.error('Could not check user roles', error);
        this.vcr.clear();
      },
    });
  }
}
