import { UtilService } from './../../services/util.service';
import { Action, ActionType, BaseAction, BBCHAction, BrixAction, PlantingAction } from 'src/app/models/action.model';
import { ModalController, Platform } from '@ionic/angular';
import { VineyardService } from './../../services/vineyard.service';
import { Component, Input, OnChanges } from '@angular/core';
import { Vineyard, VineyardPermissions } from 'src/app/models/vineyard.model';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Router } from '@angular/router';
import { AddActionComponent } from '../add-action/add-action.component';
import { ActionService } from '../../services/action.service';
import { VarietyService } from '../../services/variety.service';
import { Variety } from '../../models/variety.model';

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

  async removeAction(action: Action) {
    await this.actionService.removeAction(this.vineyard, action);
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
    await modal.present();

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
      let varietyId: string;
      if (!variety) {
        varietyId = await this.varietyService.addVariety(this.vineyard, {
          name: data.variety,
        });
      } else {
        varietyId = variety.id;
      }
      await this.addAction({
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
      await this.addAction({
        id: data.id,
        type: data.type,
        date: data.date,
        description: data.description,
        bbch: data.bbch,
        variety: data.varietyId,
        files: data.files,
      } as BBCHAction);
    } else if (data.type === ActionType.Brix) {
      await this.addAction({
        id: data.id,
        type: data.type,
        date: data.date,
        description: data.description,
        variety: data.varietyId,
        value: data.value,
        files: data.files,
      } as BrixAction);
    } else {
      await this.addAction({
        id: data.id,
        type: data.type,
        date: data.date,
        description: data.description,
        variety: data.varietyId,
        files: data.files,
      });
    }
  }

  async addAction(action: BaseAction) {
    if (action.id !== '') {
      await this.actionService.updateAction(this.vineyard, action);
    } else {
      await this.actionService.addAction(this.vineyard, action);
    }
  }

  getVarieties(varieties: string[] | undefined): Variety[] {
    return varieties
      ? varieties.map((v: string) => this.varietyService.getVarietyByID(v)).filter((v: Variety) => !!v)
      : [];
  }

  public readonly VineyardPermissions = VineyardPermissions;
}
