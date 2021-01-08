import { MapMode } from './../../../models/mapmode.model';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import {UsermenuComponent} from '../usermenu/usermenu.component';
import {PopoverController} from '@ionic/angular';
import {LayersComponent} from './layers/layers.component';
import {BACKGROUND_LAYERS} from '../../../conf/layers.config';
import {Layer} from '../../../models/layer.model';
import { OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit, OnChanges {

  @Input()
  dirty: boolean;

  @Input()
  mapMode: MapMode;

  @Output()
  updateState = new EventEmitter<boolean>();

  @Output()
  updateMapMode = new EventEmitter<MapMode>();

  @Output()
  updateBackgroundLayers = new EventEmitter<Layer[]>();

  public mapModes = MapMode;

  public layers: Layer[] = [...BACKGROUND_LAYERS];

  constructor(
      private popoverController: PopoverController,
  ) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
  }

  save(): void {
    this.updateState.emit(true);
  }

  discard(): void {
    this.updateState.emit(false);
  }

  setMapMode(mode: MapMode) {
    this.updateMapMode.emit(mode);
  }

  async showLayersMenu(event) {
    const popover = await this.popoverController.create({
      component: LayersComponent,
      event,
      showBackdrop: false,
      translucent: true,
      componentProps: {
        layers: this.layers
      }
    });
    popover.onDidDismiss().then((e: OverlayEventDetail<any>) => {
      this.layers = e.data.layers;
    });
    return await popover.present();
  }

}
