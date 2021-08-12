import {Component, Input, OnInit} from '@angular/core';
import {Vineyard} from '../../models/vineyard.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoadingController, ModalController} from '@ionic/angular';
import {UploadService} from '../../services/upload.service';
import {VineyardNote} from '../../models/vineyardnote.model';

@Component({
    selector: 'app-add-note-notebook',
    templateUrl: './add-note-notebook.component.html',
    styleUrls: ['./add-note-notebook.component.scss'],
})
export class AddNoteNotebookComponent implements OnInit {

    @Input()
    vineyard: Vineyard;

    @Input()
    note: VineyardNote;

    public noteForm: FormGroup;
    private _loading: HTMLIonLoadingElement;

    constructor(
        private modalController: ModalController,
        private uploadService: UploadService,
        private loadingController: LoadingController
    ) {
    }

    ngOnInit() {
        if (this.note) {
            this.noteForm = new FormGroup({
                title: new FormControl(this.note.title),
                description: new FormControl(this.note.description, [Validators.required]),
            });
        } else {
            this.noteForm = new FormGroup({
                title: new FormControl('', [Validators.required]),
                description: new FormControl('', [Validators.required]),
            });
        }
    }

    save() {
        this.closeDialog([]);
    }


    closeDialog(files: string[]) {
        this.modalController.dismiss({
            note: {
                id: this.note ? this.note.id : '',
                ...this.noteForm.value,
                date: new Date().toDateString()
            }
        });
    }

    discard() {
        this.modalController.dismiss({
            note: undefined
        });
    }


}
