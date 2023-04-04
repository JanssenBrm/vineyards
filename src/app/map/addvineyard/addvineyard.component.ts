import { Component, Input, OnInit } from '@angular/core';
import { Polygon } from 'ol/geom';
import { ModalController } from '@ionic/angular';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-addvineyard',
  templateUrl: './addvineyard.component.html',
  styleUrls: ['./addvineyard.component.scss'],
})
export class AddVineyardComponent implements OnInit {
  @Input()
  geometry: Polygon;

  constructor(private modalController: ModalController) {}

  public vineyardForm: UntypedFormGroup;

  ngOnInit() {
    this.vineyardForm = new UntypedFormGroup({
      name: new UntypedFormControl('', [Validators.required]),
      address: new UntypedFormControl('', [Validators.required]),
    });
  }

  save() {
    this.modalController.dismiss({
      vineyard: {
        ...this.vineyardForm.value,
        geometry: this.geometry,
      },
    });
  }

  discard() {
    this.modalController.dismiss({
      vineyard: undefined,
    });
  }
}
