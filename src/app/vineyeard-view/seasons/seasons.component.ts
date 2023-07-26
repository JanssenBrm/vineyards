import { Component, Input, OnChanges } from '@angular/core';
import { Action } from '../../models/action.model';
import { SeasonsService } from '../../services/seasons.service';
import { StatisticsService } from '../../services/statistics.service';
import { MeteoStatEntry, Vineyard } from '../../models/vineyard.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seasons',
  templateUrl: './seasons.component.html',
  styleUrls: ['./seasons.component.scss'],
})
export class SeasonsComponent implements OnChanges {
  @Input()
  vineyard: Vineyard;

  @Input()
  actions: Action[];

  @Input()
  seasons: number[];

  info: {
    year: number;
    season: [moment.Moment, moment.Moment];
    duration: number;
    dgd: number;
  }[] = [];

  loading: boolean;

  private subscription: Subscription;

  constructor(private seasonService: SeasonsService, private statService: StatisticsService) {
    this.loading = true;
  }

  ngOnChanges(): void {
    if (this.vineyard) {
      this.getStats();
    }
  }

  private getStats() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.loading = true;
    this.subscription = this.statService.getMeteoListener().subscribe({
      next: (stats: MeteoStatEntry[]) => {
        if (stats.length > 0) {
          this.calculateSeasonInfo(stats);
          this.loading = false;
        }
      },
    });
    this.statService.getMeteoStats(this.vineyard);
  }

  private calculateSeasonInfo(stats: MeteoStatEntry[]) {
    this.info = this.seasons.map((year: number) => {
      const season = this.seasonService.calculateGrowingSeason(year, stats, this.actions);
      const dgd = this.statService.calculateDgdSeries(year, stats, this.actions).reverse();
      return {
        year,
        season,
        duration: season[1].diff(season[0], 'days'),
        dgd: Math.round(dgd[0].y),
      };
    });
  }
}
