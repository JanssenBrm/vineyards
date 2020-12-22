import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Season } from 'src/app/models/season.model';
import {MenuController} from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnChanges {

  @Input()
  title: string;

  @Input()
  menuId: string;

  @Input()
  seasons: number[];

  @Input()
  activeSeasons: number[];

  @Input()
  showBackButton = true;

  @Input()
  showSeasons = true;

  @Output()
  setSeasons: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor(
      private menuController: MenuController

  ) { }

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

  async toggleMenu(id: string) {
      await this.menuController.open();
  }

}
