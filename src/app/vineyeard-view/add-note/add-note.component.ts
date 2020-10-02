import {Component, Input, OnInit} from '@angular/core';
import {VintageStage} from '../../models/stage.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {LoadingController, ModalController} from '@ionic/angular';
import {UploadService} from '../../services/upload.service';
import {mergeAll, mergeMap, switchMap} from 'rxjs/operators';
import {Vineyard} from '../../models/vineyard.model';
import {Vintage} from '../../models/vintage.model';
import {forkJoin, merge, of} from 'rxjs';
import {Note} from '../../models/note.model';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss'],
})
export class AddNoteComponent implements OnInit {

  @Input()
  vineyard: Vineyard;

  @Input()
  vintage: Vintage;

  @Input()
  note: Note;

  public VINTAGE_STAGES = VintageStage;
  public STAGES = Object.keys(VintageStage);

  public noteForm: FormGroup;

  private _files: File[];
  private _loading: HTMLIonLoadingElement;

  constructor(
      private modalController: ModalController,
      private uploadService: UploadService,
      private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this._files = [];

    if (this.note) {
      this.noteForm = new FormGroup({
        date: new FormControl(this.note.date, [Validators.required]),
        stage: new FormControl(this.note.stage),
        description: new FormControl(this.note.description, [Validators.required]),
        files: new FormControl([this.note.files])
      });
    } else {
      this.noteForm = new FormGroup({
        date: new FormControl('', [Validators.required]),
        stage: new FormControl(''),
        description: new FormControl('', [Validators.required]),
        files: new FormControl([])
      });
    }
  }

  readFile(filelist: FileList) {
    this._files = this.uploadService.readFileList(filelist);
  }

  save() {
    if (this._files.length > 0) {
      this.presentLoading();
      forkJoin(
          this._files.map(f => this.uploadService.uploadFile(`attachments/${this.vineyard.id}/${this.vintage.id}/notes/${f.name}_${moment().format('YYYYMMDD_HHmmSS')}`, f))
      ).subscribe((urls: string[]) => {
        this.hideLoading();
        this.closeDialog(urls);
      });
    } else {
      if (this.note) {
        this.closeDialog(this.note.files);
      } else {
        this.closeDialog([]);
      }
    }
  }

  async presentLoading() {
    this._loading = await this.loadingController.create({
      message: 'Creating note...',
    });
    this._loading.present();
  }

  async hideLoading() {
    this._loading.dismiss();
  }

  closeDialog(files: string[]) {
    this.modalController.dismiss({
      note: {
        id: this.note ? this.note.id : '',
        ...this.noteForm.value,
        date: this.noteForm.value.date.split('T')[0],
        files: files !== undefined ? files : []
      }});
  }

  discard() {
    this.modalController.dismiss({
      note: undefined
    });
  }

}
