import { Vineyard } from 'src/app/models/vineyard.model';
import { BBCH_STAGES } from './../../conf/bbch.config';
import { ActionType } from 'src/app/models/action.model';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BBCH } from 'src/app/models/bbch.model';
import {Action} from '../../../../functions/src/models/action.model';
import {BehaviorSubject} from 'rxjs';
import {VarietyService} from '../../services/variety.service';
import {Variety} from '../../models/variety.model';

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
  
  constructor(private modalController: ModalController,
              private varietyService: VarietyService) { }

  public actionForm: FormGroup;
  public actionTypes: string[];
  public bbchCodes: BBCH[];

  public varieties: BehaviorSubject<Variety[]>;

  ngOnInit() {
    this.actionTypes = Object.keys(ActionType);
    this.bbchCodes = BBCH_STAGES;
    this.varieties = this.varietyService.getVarietyListener();

    if (this.action) {
      console.log(this.action);
      this.actionForm = new FormGroup({
        type: new FormControl(this.actionTypes.find((a: string) => ActionType[a] === this.action.type), [Validators.required]),
        date: new FormControl(this.action.date, [Validators.required]),
        description: new FormControl(this.action.description),
        bbch: new FormControl(this.action.bbch),
        varietyId: new FormControl(this.action.variety || []),
        variety: new FormControl(''),
        rows: new FormControl(''),
        plantsPerRow: new FormControl(''),
        value: new FormControl('')
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
        value: new FormControl('')
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
      }  else if (type === 'Brix') {
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

  save() {
    this.modalController.dismiss({
      action: {
        ...this.actionForm.value,
        id: this.action ? this.action.id : '',
        date: this.actionForm.value.date.split('T')[0],
        type: ActionType[this.actionForm.value.type]
    }});
  }

  discard() {
    this.modalController.dismiss({
      action: undefined
    });
  }

}
