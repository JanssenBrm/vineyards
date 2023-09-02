import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appHasPermissions]',
})
export class HasPermissionsDirective {
  constructor(private vcr: ViewContainerRef, private tpl: TemplateRef<any>) {}

  @Input() set appHasPermissions({ vineyard, permissions }) {
    if (vineyard.permissions >= permissions) {
      this.vcr.createEmbeddedView(this.tpl);
    } else {
      this.vcr.clear();
    }
  }
}
