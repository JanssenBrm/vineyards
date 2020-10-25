import { UtilService } from './../../services/util.service';
import { Action } from 'src/app/models/action.model';
import {ModalController, Platform} from '@ionic/angular';
import { VineyardService } from './../../services/vineyard.service';
import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';
import { Vineyard } from 'src/app/models/vineyard.model';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Router } from '@angular/router';
import {AddActionComponent} from '../add-action/add-action.component';
import * as uuid from 'uuid';
import {BehaviorSubject} from 'rxjs';
import {ActionService} from '../../services/action.service';
import {VarietyService} from '../../services/variety.service';
import {Variety} from '../../models/variety.model';
import {SeasonsService} from '../../services/seasons.service';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnInit, OnChanges {

  @Input()
  vineyard: Vineyard;

  @Input()
  seasons: number[];

  actions: BehaviorSubject<Action[]>;
  activeSeasons: BehaviorSubject<number[]>;

  constructor(public utilService: UtilService, public vineyardService: VineyardService, private photoViewer: PhotoViewer, private platform: Platform,
              private router: Router,  private modalController: ModalController,
              private actionService: ActionService,
              private varietyService: VarietyService,
              private seasonService: SeasonsService) { }

  ngOnInit() {
   this.actions = this.actionService.getActionListener();
   this.activeSeasons = this.seasonService.getActiveSeasonListener();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.vineyard) {
      this.actionService.getActions(this.vineyard);
      this.varietyService.getVarieties(this.vineyard);
    }
  }

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
    this.actionService.removeAction(this.vineyard, action);
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
    if (data.type === 'planting') {
      const variety = this.varietyService.getVarietyByName(data.variety);
      if (!variety) {
        this.varietyService.addVariety(this.vineyard, {
          plantsPerRow: data.plantsPerRow,
          name: data.variety,
          rows: data.rows
        }).then((id: string ) => this.addAction({
          id: data.id,
          type: data.type,
          date: data.date,
          description: data.description,
          bbch: data.bbch,
          variety: [id],
          value: data.value
        }));
      } else {
        this.varietyService.updateVariety(this.vineyard, {
          ...variety,
          plantsPerRow: data.plantsPerRow,
          name: data.variety,
          rows: data.rows
        });
        data.varietyId = [variety.id];
        this.addAction({
          id: data.id,
          type: data.type,
          date: data.date,
          description: data.description,
          bbch: data.bbch,
          variety: data.varietyId,
          value: data.value
        });
      }
    } else {
      this.addAction({
        id: data.id,
        type: data.type,
        date: data.date,
        description: data.description,
        bbch: data.bbch,
        variety: data.varietyId,
        value: data.value
      });
    }

  }

  addAction(action: Action) {
    if (action.id !== '') {
      this.actionService.updateAction(this.vineyard, action);
    } else {
      this.actionService.addAction(this.vineyard, action);
    }
  }

  getVarieties(varieties: string[] | undefined): Variety[] {
    return varieties ? varieties.map((v: string) => this.varietyService.getVarietyByID(v)).filter((v: Variety) => !!v) : [];
  }

  getVarietiesLabel(varieties: string[] | undefined): string[] {
    return this.getVarieties(varieties).map((v: Variety) => v.name);
  }


}
