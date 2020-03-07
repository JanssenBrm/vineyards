import { VineyardService } from './../../services/vineyard.service';
import { Vineyard } from './../../models/vineyard.model';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, OnChanges {

  @Input()
  vineyard: Vineyard;

  constructor(private vineyardService: VineyardService) { }

  seasons: number[];
  activeSeasons: number[];

  ngOnInit() {
    this.activeSeasons = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.vineyard && this.vineyard) {
      this.seasons = this.vineyardService.getYears(this.vineyard);
      this.activeSeasons = [this.seasons[this.seasons.length - 1]];
      this.getStats();
    }
  }

  getStats(): void {
    console.log('Get stats');
  }

  updateSeasons(): void {
    if (this.activeSeasons.length == 0) {
      this.activeSeasons = [this.seasons[this.seasons.length - 1]];
    }
    this.getStats();
  }

}
