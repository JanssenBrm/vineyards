import { UtilService } from './../../services/util.service';
import { Action, ActionType } from 'src/app/models/action.model';
import { ModalController, Platform } from '@ionic/angular';
import { VineyardService } from './../../services/vineyard.service';
import { Component, Input, OnChanges } from '@angular/core';
import { Vineyard } from 'src/app/models/vineyard.model';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Router } from '@angular/router';
import { AddActionComponent } from '../add-action/add-action.component';
import { ActionService } from '../../services/action.service';
import { VarietyService } from '../../services/variety.service';
import { Variety } from '../../models/variety.model';
import { BBCHAction, BrixAction, PlantingAction } from '../../../../functions/src/models/action.model';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
})
export class ActionsComponent implements OnChanges {
  @Input()
  vineyard: Vineyard;

  @Input()
  actions: Action[];

  @Input()
  varieties: Variety[];

  ACTIONTYPES = ActionType;

  actionTypes = Object.keys(ActionType);

  activeTypes: string[] = Object.keys(ActionType);

  activeVarieties: string[];

  constructor(
    public utilService: UtilService,
    public vineyardService: VineyardService,
    private photoViewer: PhotoViewer,
    private platform: Platform,
    private router: Router,
    private modalController: ModalController,
    public actionService: ActionService,
    public varietyService: VarietyService
  ) {}

  ngOnChanges() {
    this.activeVarieties = this.varieties.map((v: Variety) => v.id);
  }

  getImage(type: string): string {
    return `/assets/icon/${type}.png`;
  }

  showPicture(url: string) {
    if (!this.platform.is('cordova')) {
      window.location.href = url;
    } else {
      this.photoViewer.show(url);
    }
  }

  removeAction(action: Action) {
    this.actionService.removeAction(this.vineyard, action);
  }

  getActionTypeColor(stage: string): string {
    const color = this.actionService.getActionTypeColor(stage);
    if (color && this.activeTypes.find((s) => s === stage)) {
      return color;
    } else {
      return 'lightgrey';
    }
  }

  toggleActionType(stage: string) {
    if (this.activeTypes.find((s) => s === stage)) {
      this.activeTypes = this.activeTypes.filter((s) => s !== stage);
    } else {
      this.activeTypes = [...this.activeTypes, stage];
    }
  }

  async openAddActionModal(action?: Action) {
    const modal = await this.modalController.create({
      component: AddActionComponent,
      componentProps: {
        vineyard: this.vineyard,
        action,
      },
    });
    modal.present();

    const data = await modal.onWillDismiss();
    if (data.data.action) {
      await this.parseAction(data.data.action);
    }
  }

  async parseAction(data: any) {
    if (data.type === ActionType.Planting) {
      const variety = data.variety
        ? this.varietyService.getVarietyByName(data.variety)
        : this.varietyService.getVarietyByID(data.varietyId);
      let varietyId: string = undefined;
      if (!variety) {
        varietyId = await this.varietyService.addVariety(this.vineyard, {
          name: data.variety,
        });
      } else {
        varietyId = variety.id;
      }
      this.addAction({
        id: data.id,
        type: data.type,
        date: data.date,
        description: data.description,
        variety: [varietyId],
        files: data.files,
        rows: data.rows,
        plantsPerRow: data.plantsPerRow,
      } as PlantingAction);
    } else if (data.type === ActionType.BBCH) {
      this.addAction({
        id: data.id,
        type: data.type,
        date: data.date,
        description: data.description,
        bbch: data.bbch,
        variety: data.varietyId,
        files: data.files,
      } as BBCHAction);
    } else if (data.type === ActionType.Brix) {
      this.addAction({
        id: data.id,
        type: data.type,
        date: data.date,
        description: data.description,
        variety: data.varietyId,
        value: data.value,
        files: data.files,
      } as BrixAction);
    } else {
      this.addAction({
        id: data.id,
        type: data.type,
        date: data.date,
        description: data.description,
        variety: data.varietyId,
        files: data.files,
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
    return varieties
      ? varieties.map((v: string) => this.varietyService.getVarietyByID(v)).filter((v: Variety) => !!v)
      : [];
  }
}
