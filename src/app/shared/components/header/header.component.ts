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
  activeSeason: number;

  @Output()
  setSeason: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.seasons) {
      if (!this.activeSeason && this.seasons && this.seasons.length > 0) {
          this.activeSeason = this.seasons[this.seasons.length - 1];
      }
    }
  }

  updateSeason() {
    this.setSeason.emit(this.activeSeason);
  }

}
