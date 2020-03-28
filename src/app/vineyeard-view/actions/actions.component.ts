import { Action } from 'src/app/models/action.model';
import { Platform } from '@ionic/angular';
import { VineyardService } from './../../services/vineyard.service';
import { Component, OnInit, Input } from '@angular/core';
import { Vineyard } from 'src/app/models/vineyard.model';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnInit {

  @Input()
  vineyard: Vineyard;

  @Input()
  seasons: number[];

  constructor(public vineyardService: VineyardService, private photoViewer: PhotoViewer, private platform: Platform, private router: Router) { }

  ngOnInit() {}

  getImage(type: string): string {
    return `/assets/icon/${type}.png`;
  }

  showPicture(url: string) {
    console.log(this.platform);
    if (!this.platform.is('cordova')) {
      console.log('opening url');
      window.location.href =  url;
    } else {
      console.log('opening photoviewer');
      this.photoViewer.show(url);
    }
  }

  removeAction(action: Action) {
    const actions: Action[] = this.vineyard.actions.filter((a: Action) => !(a.date == action.date && a.type === action.type && a.description === action.description));
    this.vineyard.actions = actions;
    this.vineyardService.updateVineyard(this.vineyard);
  }

}
