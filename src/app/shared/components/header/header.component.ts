import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Season } from 'src/app/models/season.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnChanges {

  @Input()
  title: string;

  @Input()
  seasons: number[];

  @Input()
  activeSeasons: number[];

  @Input()
  showBackButton = true;

  @Output()
  setSeasons: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.seasons) {
      if (!this.activeSeasons && this.seasons && this.seasons.length > 0) {
          this.activeSeasons = [this.seasons[this.seasons.length - 1]];
      }
    }
  }

  updateSeasons() {
    if (this.activeSeasons.length === 0) {
      this.activeSeasons = [this.seasons[this.seasons.length - 1]];
    }
    this.setSeasons.emit(this.activeSeasons);
  }

}
