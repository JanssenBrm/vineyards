import { VineyardService } from './../../services/vineyard.service';
import { Component, OnInit, Input } from '@angular/core';
import { Vineyard } from 'src/app/models/vineyard.model';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnInit {

  @Input()
  vineyard: Vineyard;

  @Input()
  season: number;

  constructor(public vineyardService: VineyardService) { }

  ngOnInit() {}

  getImage(type: string): string {
    return `/assets/icon/${type}.png`;
  }

}
