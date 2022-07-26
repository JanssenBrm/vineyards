import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeaturesService } from '../../services/features.service';

@Directive({
  selector: '[appPremiumFeature]',
})
export class PremiumFeatureDirective implements OnInit {
  constructor(private featureService: FeaturesService, private vcr: ViewContainerRef, private tpl: TemplateRef<any>) {}

  ngOnInit() {
    this.featureService.isUserPremium().subscribe({
      next: (premium: boolean) => {
        if (premium) {
          this.vcr.createEmbeddedView(this.tpl);
        } else {
          this.vcr.clear();
        }
      },
      error: (error: any) => {
        console.error('Could not check premium feature', error);
        this.vcr.clear();
      },
    });
  }
}
