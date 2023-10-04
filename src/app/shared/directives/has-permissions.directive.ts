import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { VineyardPermissions } from '../../models/vineyard.model';

@Directive({
  selector: '[appHasPermissions]',
})
export class HasPermissionsDirective {
  constructor(private vcr: ViewContainerRef, private tpl: TemplateRef<any>) {}

  @Input() set appHasPermissions({ vineyard, permissions }) {
    if ((vineyard?.permissions || VineyardPermissions.NONE) >= permissions) {
      this.vcr.createEmbeddedView(this.tpl);
    } else {
      this.vcr.clear();
    }
  }
}
