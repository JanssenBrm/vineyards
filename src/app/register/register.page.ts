import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilService } from '../services/util.service';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  public form: UntypedFormGroup;

  public loading = false;

  constructor(
    public authService: AuthService,
    public toastController: ToastController,
    public router: Router,
    public utilService: UtilService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    this.form = new UntypedFormGroup({
      username: new UntypedFormControl('', Validators.required),
      password: new UntypedFormControl('', Validators.required),
    });
  }

  register() {
    this.loading = true;
    this.authService.register(this.form.get('username').value, this.form.get('password').value).catch((error: any) => {
      this.analytics.logEvent('auth_register_failed', { username: this.form.get('username').value, error });
      this.showError(error.message);
      this.loading = false;
    });
  }

  async showError(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: 'danger',
    });
    toast.present();
  }
}
