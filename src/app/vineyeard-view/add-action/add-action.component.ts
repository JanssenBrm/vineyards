import { Vineyard } from 'src/app/models/vineyard.model';
import { BBCH_STAGES } from './../../conf/bbch.config';
import { ActionType } from 'src/app/models/action.model';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { BBCH } from 'src/app/models/bbch.model';
import { Action } from '../../../../functions/src/models/action.model';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { VarietyService } from '../../services/variety.service';
import { Variety } from '../../models/variety.model';
import { UploadService } from '../../services/upload.service';
import * as moment from 'moment';

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

  public actionForm: FormGroup;

  public actionTypes: string[];

  public bbchCodes: BBCH[];

  public varieties: BehaviorSubject<Variety[]>;

  private _files: File[];

  private _loading: HTMLIonLoadingElement;

  ngOnInit() {
    this._files = [];
    this.actionTypes = Object.keys(ActionType);
    this.bbchCodes = BBCH_STAGES;
    this.varieties = this.varietyService.getVarietyListener();

    if (this.action) {
      console.log(this.action);
      this.actionForm = new FormGroup({
        type: new FormControl(
          this.actionTypes.find((a: string) => ActionType[a] === this.action.type),
          [Validators.required]
        ),
        date: new FormControl(this.action.date, [Validators.required]),
        description: new FormControl(this.action.description),
        bbch: new FormControl(this.action.bbch),
        varietyId: new FormControl(this.action.variety || []),
        variety: new FormControl(''),
        rows: new FormControl(''),
        plantsPerRow: new FormControl(''),
        value: new FormControl(''),
        files: new FormControl([this.action.files]),
      });

      if (this.action.type === 'planting') {
        const variety: Variety = this.varietyService.getVarietyByID(this.action.variety[0]);
        this.actionForm.get('rows').setValue(variety.rows);
        this.actionForm.get('plantsPerRow').setValue(variety.plantsPerRow);
        this.actionForm.get('variety').setValue(variety.name);
      }
    } else {
      this.actionForm = new FormGroup({
        type: new FormControl('', [Validators.required]),
        date: new FormControl('', [Validators.required]),
        description: new FormControl(''),
        bbch: new FormControl(''),
        varietyId: new FormControl([]),
        variety: new FormControl(''),
        rows: new FormControl(''),
        plantsPerRow: new FormControl(''),
        value: new FormControl(''),
        files: new FormControl([]),
      });
    }

    this.actionForm.get('type').valueChanges.subscribe((type: string) => {
      if (type === 'BBCH') {
        this.actionForm.get('bbch').setValidators([Validators.required]);
        this.actionForm.get('varietyId').setValidators([Validators.required]);
      } else if (type === 'Planting') {
        this.actionForm.get('variety').setValidators([Validators.required]);
        this.actionForm.get('rows').setValidators([Validators.required]);
        this.actionForm.get('plantsPerRow').setValidators([Validators.required]);
        this.actionForm.get('varietyId').setValidators(null);
        this.actionForm.get('varietyId').setValue([]);
      } else if (type === 'Brix') {
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
        type: ActionType[this.actionForm.value.type],
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
