import { MapMode } from './../../../models/mapmode.model';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

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

  public mapModes = MapMode;

  constructor() { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
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

}
