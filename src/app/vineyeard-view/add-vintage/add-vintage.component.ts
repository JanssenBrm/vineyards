import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Vineyard} from '../../models/vineyard.model';
import {ActionType} from '../../models/action.model';
import {LoadingController, ModalController} from '@ionic/angular';
import * as moment from 'moment';
import {Vintage, VINTAGE_STATUS} from '../../models/vintage.model';
import {VintageColor} from '../../models/vintagecolor.model';
import {UploadService} from '../../services/upload.service';
import {BehaviorSubject, forkJoin} from 'rxjs';
import {VintageEvent} from '../../models/vintageevent.model';
import {Variety} from '../../models/variety.model';
import {VarietyService} from '../../services/variety.service';

@Component({
  selector: 'app-add-vintage',
  templateUrl: './add-vintage.component.html',
  styleUrls: ['./add-vintage.component.scss'],
})
export class AddVintageComponent implements OnInit {

  @Input()
  vineyard: Vineyard;

  @Input()
  vintage: Vintage;

  public vintageForm: FormGroup;
  public colors: string[];

  private _files: File[];
  private _loading: HTMLIonLoadingElement;

  public VINTAGE_STATUS = VINTAGE_STATUS;
  public STATUSES = Object.keys(VINTAGE_STATUS);

  public varieties: BehaviorSubject<Variety[]>;

  constructor(
      private modalController: ModalController,
      private uploadService: UploadService,
      private varietyService: VarietyService,
      private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.colors = Object.keys(VintageColor);
    this.varieties = this.varietyService.getVarietyListener();
    if (this.vintage) {
      this.vintageForm = new FormGroup({
        year: new FormControl(`${this.vintage.year}-01-01'`, [Validators.required]),
        name: new FormControl(this.vintage.name, [Validators.required]),
        color: new FormControl(this.vintage.color, [Validators.required]),
        varieties: new FormControl(this.vintage.varieties, [Validators.required]),
        cover: new FormControl([this.vintage.cover]),
        status: new FormControl(this.vintage.status, [Validators.required])
      });
    } else {
      this.vintageForm = new FormGroup({
        year: new FormControl('', [Validators.required]),
        name: new FormControl('', [Validators.required]),
        color: new FormControl('', [Validators.required]),
        varieties: new FormControl([], [Validators.required]),
        cover: new FormControl([]),
        status: new FormControl(this.STATUSES[0], [Validators.required])
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
          this._files.map(f => this.uploadService.uploadFile(`attachments/${this.vineyard.id}/${this.vintage.id}/cover/${f.name}_${moment().format('YYYYMMDD_HHmmSS')}`, f))
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
        year: moment(this.vintageForm.value.year).year(),
        cover: files !== undefined && files.length > 0 ? files[0] : 'assets/images/vintage.jpg'
      }});
  }

  discard() {
    this.modalController.dismiss({
      vintage: undefined
    });
  }



}
