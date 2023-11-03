import { getPermissionString, Vineyard, VineyardPermissions } from 'src/app/models/vineyard.model';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { isNumeric } from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-add-permissions',
  templateUrl: './add-permissions.component.html',
  styleUrls: ['./add-permissions.component.scss'],
})
export class AddPermissionsComponent implements OnInit {
  @Input()
  vineyard: Vineyard;

  @Input()
  user: string;

  @Input()
  permissions: VineyardPermissions;

  constructor(private modalController: ModalController, private loadingController: LoadingController) {}

  public permissionsForm: FormGroup;

  public readonly getPermissionString = getPermissionString;

  public PermissionValues = Object.values(VineyardPermissions).filter(
    (v) => isNumeric(v) && ![VineyardPermissions.NONE, VineyardPermissions.OWNER].includes(+v)
  );

  ngOnInit() {
    this.permissionsForm = new FormGroup({
      user: new FormControl(this.user || '', [Validators.required]),
      permissions: new FormControl(this.permissions, [Validators.required]),
    });
  }

  save() {
    this.modalController.dismiss(this.permissionsForm.value);
  }

  discard() {
    this.modalController.dismiss();
  }
}
