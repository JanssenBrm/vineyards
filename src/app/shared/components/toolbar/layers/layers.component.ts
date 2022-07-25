import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Layer } from '../../../../models/layer.model';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss'],
})
export class LayersComponent {
  @Input()
  public layers: Layer[];

  constructor(private popoverController: PopoverController) {}

  toggleLayer(layer: Layer) {
    this.layers = this.layers.map((l: Layer) => ({
      ...l,
      enabled: l.id === layer.id ? !l.enabled : l.enabled,
    }));
    this.save();
  }

  save() {
    this.popoverController.dismiss({
      layers: this.layers,
    });
  }
}
