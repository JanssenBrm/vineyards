import {Component, Input, OnInit} from '@angular/core';
import {Polygon} from 'ol/geom';
import {ModalController} from '@ionic/angular';
import {VarietyService} from '../../services/variety.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActionType} from '../../models/action.model';
import {Vineyard} from '../../models/vineyard.model';

@Component({
  selector: 'app-addvineyard',
  templateUrl: './addvineyard.component.html',
  styleUrls: ['./addvineyard.component.scss'],
})
export class AddVineyardComponent implements OnInit {

  @Input()
  geometry: Polygon;

  constructor(private modalController: ModalController) { }

  public vineyardForm: FormGroup;

  ngOnInit() {
    this.vineyardForm = new FormGroup({
      name: new FormControl('')
    });
  }

  save() {
    this.modalController.dismiss({
      vineyard: {
        ...this.vineyardForm.value,
        geometry: this.geometry
      }});
  }

  discard() {
    this.modalController.dismiss({
      vineyard: undefined
    });
  }

}
