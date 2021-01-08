import {Component, Input, OnInit} from '@angular/core';
import {BACKGROUND_LAYERS} from '../../../../conf/layers.config';
import {PopoverController} from '@ionic/angular';
import {Layer} from '../../../../models/layer.model';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss'],
})
export class LayersComponent implements OnInit {

  @Input()
  public layers: Layer[];

  constructor(
      private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  toggleLayer(layer: Layer) {
    this.layers = this.layers.map((l: Layer)  => ({
      ...l,
      enabled: l.id === layer.id ? !l.enabled : l.enabled
    }));
  }

  save() {
    this.popoverController.dismiss({
      layers: this.layers
    });
  }
}
