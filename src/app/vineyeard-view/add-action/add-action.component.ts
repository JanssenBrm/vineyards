import { Vineyard } from 'src/app/models/vineyard.model';
import { BBCH_STAGES } from '../../conf/bbch.config';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { BBCH } from 'src/app/models/bbch.model';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { VarietyService } from '../../services/variety.service';
import { Variety } from '../../models/variety.model';
import { UploadService } from '../../services/upload.service';
import * as moment from 'moment';
import { Action, ActionType, BBCHAction, BrixAction, PlantingAction } from '../../models/action.model';

@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss'],
})
export class AddActionComponent implements OnInit {
  @Input()
  vineyard: Vineyard;

  @Input()
  action: Action;

  constructor(
    private modalController: ModalController,
    private varietyService: VarietyService,
    private uploadService: UploadService,
    private loadingController: LoadingController
  ) {}

  public actionForm: UntypedFormGroup;

  public actionTypes: string[];

  public bbchCodes: BBCH[];

  public varieties: BehaviorSubject<Variety[]>;

  private _files: File[];

  private _loading: HTMLIonLoadingElement;

  public createNewVariety: boolean;

  public ActionType = ActionType;

  ngOnInit() {
    this._files = [];
    this.actionTypes = Object.values(ActionType);
    this.bbchCodes = BBCH_STAGES;
    this.varieties = this.varietyService.getVarietyListener();
    this.createNewVariety = false;

    if (this.action) {
      this.actionForm = new UntypedFormGroup({
        type: new UntypedFormControl(
          this.actionTypes.find((a: string) => a === this.action.type),
          [Validators.required]
        ),
        date: new UntypedFormControl(this.action.date, [Validators.required]),
        description: new UntypedFormControl(this.action.description),
        bbch: new UntypedFormControl(''),
        varietyId: new UntypedFormControl(this.action.variety || []),
        variety: new UntypedFormControl(''),
        rows: new UntypedFormControl(''),
        plantsPerRow: new UntypedFormControl(''),
        value: new UntypedFormControl(''),
        files: new UntypedFormControl([this.action.files]),
      });

      if (this.action.type === ActionType.BBCH) {
        this.actionForm.get('bbch').setValue((this.action as BBCHAction).bbch);
      }

      if (this.action.type === ActionType.Planting) {
        const variety: Variety = this.varietyService.getVarietyByID(this.action.variety[0]);
        this.actionForm.get('rows').setValue((this.action as PlantingAction).rows);
        this.actionForm.get('plantsPerRow').setValue((this.action as PlantingAction).plantsPerRow);
        this.actionForm.get('variety').setValue(variety.name);
      }

      if (this.action.type === ActionType.Brix) {
        this.actionForm.get('value').setValue((this.action as BrixAction).value);
      }
    } else {
      this.actionForm = new UntypedFormGroup({
        type: new UntypedFormControl('', [Validators.required]),
        date: new UntypedFormControl('', [Validators.required]),
        description: new UntypedFormControl(''),
        bbch: new UntypedFormControl(''),
        varietyId: new UntypedFormControl([]),
        variety: new UntypedFormControl(''),
        rows: new UntypedFormControl(''),
        plantsPerRow: new UntypedFormControl(''),
        value: new UntypedFormControl(''),
        files: new UntypedFormControl([]),
      });
    }

    this.actionForm.get('varietyId').valueChanges.subscribe({
      next: (value: string) => {
        if (value === '_new_variety' && this.actionForm.get('type').value === ActionType.Planting) {
          this.createNewVariety = true;
        } else {
          this.createNewVariety = false;
        }
      },
    });

    this.actionForm.get('type').valueChanges.subscribe((type: string) => {
      if (type === ActionType.BBCH) {
        this.actionForm.get('bbch').setValidators([Validators.required]);
        this.actionForm.get('varietyId').setValidators([Validators.required]);
      } else if (type === ActionType.Planting) {
        this.actionForm.get('variety').setValidators([Validators.required]);
        this.actionForm.get('rows').setValidators([Validators.required]);
        this.actionForm.get('plantsPerRow').setValidators([Validators.required]);
        this.actionForm.get('varietyId').setValidators(null);
        this.actionForm.get('varietyId').setValue([]);
      } else if (type === ActionType.Brix) {
        this.actionForm.get('value').setValidators([Validators.required]);
      } else {
        this.actionForm.get('bbch').setValidators(null);
        this.actionForm.get('variety').setValidators(null);
        this.actionForm.get('rows').setValidators(null);
        this.actionForm.get('plantsPerRow').setValidators(null);
        this.actionForm.get('value').setValidators(null);
        this.actionForm.get('varietyId').setValidators([Validators.required]);
      }
    });
  }

  readFile(filelist: FileList) {
    this._files = this.uploadService.readFileList(filelist);
  }

  save() {
    if (this._files.length > 0) {
      this.presentLoading();
      forkJoin(
        this._files.map((f) =>
          this.uploadService.uploadFile(
            `attachments/${this.vineyard.id}/actions/${f.name}_${moment().format('YYYYMMDD_HHmmSS')}`,
            f
          )
        )
      ).subscribe((urls: string[]) => {
        this.hideLoading();
        this.closeDialog(urls);
      });
    } else {
      if (this.action) {
        this.closeDialog(this.action.files);
      } else {
        this.closeDialog([]);
      }
    }
  }

  async presentLoading() {
    this._loading = await this.loadingController.create({
      message: 'Creating action...',
    });
    this._loading.present();
  }

  async hideLoading() {
    this._loading.dismiss();
  }

  closeDialog(files: string[]) {
    this.modalController.dismiss({
      action: {
        ...this.actionForm.value,
        id: this.action ? this.action.id : '',
        date: this.actionForm.value.date.split('T')[0],
        type: this.actionForm.value.type,
        files: files !== undefined ? files : [],
      },
    });
  }

  discard() {
    this.modalController.dismiss({
      action: undefined,
    });
  }
}
