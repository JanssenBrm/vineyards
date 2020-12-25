import { UtilService } from './../../services/util.service';
import {Action, ACTION_COLORS, ActionType} from 'src/app/models/action.model';
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
import {VINTAGEEVENT_COLORS} from '../../models/vintageevent.model';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnInit, OnChanges {

  @Input()
  vineyard: Vineyard;

  @Input()
  actions: Action[];

  ACTIONTYPES = ActionType;
  actionTypes = Object.keys(ActionType);
  activeTypes: string[] = Object.keys(ActionType);

  constructor(public utilService: UtilService, public vineyardService: VineyardService, private photoViewer: PhotoViewer, private platform: Platform,
              private router: Router,  private modalController: ModalController,
              private actionService: ActionService,
              public varietyService: VarietyService) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {}

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

  getActionTypeColor(stage: string): string {
    const idx = Object.keys(ActionType).findIndex((s: string) => s === stage);
    if (idx >= 0 && this.activeTypes.find(s => s === stage)) {
      return ACTION_COLORS[idx];
    } else {
      return 'lightgrey';
    }
  }

  findActionType(type: string): string {
    return Object.keys(ActionType).find((s: string) => ActionType[s] === type);
  }

  toggleActionType(stage: string) {
    if (this.activeTypes.find(s => s === stage)) {
      this.activeTypes = this.activeTypes.filter(s => s !== stage);
    } else {
      this.activeTypes = [...this.activeTypes, stage];
    }
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



}
