import { Component, Input, OnInit } from '@angular/core';
import { Vineyard } from '../../models/vineyard.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { UploadService } from '../../services/upload.service';
import { VineyardBaseNote } from '../../models/vineyardnote.model';
import * as moment from 'moment';

@Component({
  selector: 'app-add-note-notebook',
  templateUrl: './add-note-notebook.component.html',
  styleUrls: ['./add-note-notebook.component.scss'],
})
export class AddNoteNotebookComponent implements OnInit {
  @Input()
  vineyard: Vineyard;

  @Input()
  note: VineyardBaseNote;

  public tags: string[];

  public noteForm: FormGroup;

  private _loading: HTMLIonLoadingElement;

  constructor(
    private modalController: ModalController,
    private uploadService: UploadService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    if (this.note) {
      this.tags = this.note.tags || [];
      this.noteForm = new FormGroup({
        title: new FormControl(this.note.title),
        description: new FormControl(this.note.description, [Validators.required]),
      });
    } else {
      this.tags = [];
      this.noteForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
      });
    }
  }

  save() {
    this.closeDialog();
  }

  closeDialog() {
    this.modalController.dismiss({
      note: {
        id: this.note ? this.note.id : '',
        ...this.noteForm.value,
        date: moment(),
        tags: this.tags,
      },
    });
  }

  discard() {
    this.modalController.dismiss({
      note: undefined,
    });
  }

  addTag(target: HTMLInputElement): void {
    console.log(target.value);
    const tag = target.value.toLocaleLowerCase();
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
    target.value = '';
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t: string) => t !== tag);
  }
}
