import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Vineyard } from '../../models/vineyard.model';
import { LoadingController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { Vintage, VintageStatus } from '../../models/vintage.model';
import { VintageColor } from '../../models/vintagecolor.model';
import { UploadService } from '../../services/upload.service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { Variety } from '../../models/variety.model';
import { VarietyService } from '../../services/variety.service';

@Component({
  selector: 'app-add-vintage',
  templateUrl: './add-vintage.component.html',
  styleUrls: [],
})
export class AddVintageComponent implements OnInit {
  @Input()
  vineyard: Vineyard;

  @Input()
  vintage: Vintage;

  public vintageForm: UntypedFormGroup;

  public colors: string[];

  private _files: File[];

  private _loading: HTMLIonLoadingElement;

  public VINTAGE_STATUS = VintageStatus;

  public STATUSES = Object.keys(VintageStatus);

  public varieties: BehaviorSubject<Variety[]>;

  constructor(
    private modalController: ModalController,
    private uploadService: UploadService,
    private varietyService: VarietyService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.colors = Object.keys(VintageColor);
    this.varieties = this.varietyService.getVarietyListener();
    if (this.vintage) {
      this.vintageForm = new UntypedFormGroup({
        year: new UntypedFormControl(`${this.vintage.year}-01-01'`, [Validators.required]),
        name: new UntypedFormControl(this.vintage.name, [Validators.required]),
        color: new UntypedFormControl(this.vintage.color, [Validators.required]),
        varieties: new UntypedFormControl(this.vintage.varieties, [Validators.required]),
        cover: new UntypedFormControl([this.vintage.cover]),
        status: new UntypedFormControl(this.vintage.status, [Validators.required]),
      });
    } else {
      this.vintageForm = new UntypedFormGroup({
        year: new UntypedFormControl('', [Validators.required]),
        name: new UntypedFormControl('', [Validators.required]),
        color: new UntypedFormControl('', [Validators.required]),
        varieties: new UntypedFormControl([], [Validators.required]),
        cover: new UntypedFormControl([]),
        status: new UntypedFormControl(this.STATUSES[0], [Validators.required]),
      });
    }
  }

  readFile(filelist: FileList) {
    this._files = this.uploadService.readFileList(filelist);
  }

  save() {
    if (this._files && this._files.length > 0) {
      this.presentLoading();
      forkJoin(
        this._files.map((f) =>
          this.uploadService.uploadFile(
            `attachments/${this.vineyard.id}/${this.vintage.id}/cover/${f.name}_${moment().format('YYYYMMDD_HHmmSS')}`,
            f
          )
        )
      ).subscribe((urls: string[]) => {
        this.hideLoading();
        this.closeDialog(urls);
      });
    } else {
      if (this.vintage) {
        this.closeDialog([this.vintage.cover]);
      } else {
        this.closeDialog([]);
      }
    }
  }

  async presentLoading() {
    this._loading = await this.loadingController.create({
      message: 'Creating vintage...',
    });
    this._loading.present();
  }

  async hideLoading() {
    this._loading.dismiss();
  }

  closeDialog(files: string[]) {
    this.modalController.dismiss({
      vintage: {
        id: this.vintage ? this.vintage.id : '',
        ...this.vintageForm.value,
        year: moment(this.vintageForm.value.year.replace("'", '')).year(),
        cover: files !== undefined && files.length > 0 ? files[0] : 'assets/images/vintage.jpg',
      },
    });
  }

  discard() {
    this.modalController.dismiss({
      vintage: undefined,
    });
  }
}
