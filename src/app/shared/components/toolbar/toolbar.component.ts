import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {

  @Input()
  dirty: boolean;

  @Output()
  updateState = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {}

  save(): void {
    this.updateState.emit(true);
  }

  discard(): void {
    this.updateState.emit(false);
  }

}
