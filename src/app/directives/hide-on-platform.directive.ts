import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {Platform} from '@ionic/angular';

@Directive({
  selector: '[appHideOnPlatform]'
})
export class HideOnPlatformDirective {

  constructor(
      private platform: Platform,
      private vcr: ViewContainerRef,
      private tpl: TemplateRef<any>
  ) { }

  @Input() set appHideOnPlatform(platforms: string[]) {
    if (platforms.filter((p: string) => this.platform.platforms().includes(p)).length > 0) {
      this.vcr.clear();
    } else {
      this.vcr.createEmbeddedView(this.tpl);

    }
  }
}
