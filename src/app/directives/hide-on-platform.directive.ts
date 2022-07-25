import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Platform } from '@ionic/angular';

@Directive({
  selector: '[appHideOnPlatform]',
})
export class HideOnPlatformDirective {
  mappings = {
    mobile: ['ios', 'android'],
    desktop: ['desktop'],
  };

  constructor(private platform: Platform, private vcr: ViewContainerRef, private tpl: TemplateRef<any>) {}

  @Input() set appHideOnPlatform(platforms: string[]) {
    if (
      []
        .concat(...platforms.map((p: string) => this.mappings[p]))
        .filter((p: string) => this.platform.platforms().includes(p)).length > 0
    ) {
      this.vcr.clear();
    } else {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
