import { UtilService } from './../../services/util.service';
import { Action } from 'src/app/models/action.model';
import {ModalController, Platform} from '@ionic/angular';
import { VineyardService } from './../../services/vineyard.service';
import { Component, OnInit, Input } from '@angular/core';
import { Vineyard } from 'src/app/models/vineyard.model';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Router } from '@angular/router';
import {AddActionComponent} from '../add-action/add-action.component';
import * as uuid from 'uuid';

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

  constructor(public utilService: UtilService, public vineyardService: VineyardService, private photoViewer: PhotoViewer, private platform: Platform,
              private router: Router,  private modalController: ModalController) { }

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

  removeAction(action: Action) {
    const actions: Action[] = this.vineyard.actions
        .filter((a: Action) => !(a.date === action.date && a.type === action.type && a.description === action.description));
    this.vineyard.actions = actions;
    this.vineyardService.updateVineyard(this.vineyard);
  }

  async openAddActionModal(action?: Action) {
    const modal = await this.modalController.create({
      component: AddActionComponent,
      componentProps: {
        vineyard: this.vineyard,
        action: action
      }
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.action) {
      this.parseAction(data.data.action);
    }
  }

  parseAction(data: any) {

    let id = null;

    if (data.type === 'planting') {
      id = uuid.v4();
      this.vineyard.varieties.push({
        id,
        plantsPerRow: data.plantsPerRow,
        name: data.variety,
        rows: data.rows
      });
    }

    const action: Action = {
      type: data.type,
      date: data.date,
      description: data.description,
      bbch: data.bbch,
      variety: id ? [id] : data.varietyId,
      value: data.value
    };

    this.vineyard.actions.push(action);
    this.vineyardService.updateVineyard(this.vineyard);
  }


}
