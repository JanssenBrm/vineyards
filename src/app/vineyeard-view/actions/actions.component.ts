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
  season: number;

  constructor(public vineyardService: VineyardService, private photoViewer: PhotoViewer, private platform: Platform, private router: Router) { }

  ngOnInit() {}

  getImage(type: string): string {
    return `/assets/icon/${type}.png`;
  }

  showPicture(url: string) {
    if (!this.platform.is('cordova')) {
      window.location.href =  url;
    } else {
      this.photoViewer.show(url);
    }
  }

}
