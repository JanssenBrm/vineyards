import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {Platform, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {UtilService} from '../services/util.service';
import {AngularFireAnalytics} from '@angular/fire/analytics';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  public form: FormGroup;
  public loading = false;

  constructor(
      public authService: AuthService,
      public toastController: ToastController,
      public router: Router,
      public utilService: UtilService,
      private analytics: AngularFireAnalytics
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required)
    });
  }

  resetPassword() {
    this.loading = true;
    this.authService.sendPasswordResetEmail(this.form.get('username').value)
        .then(() => {
          this.loading = false;
          this.showMessage('Password reset email sent, check your inbox.');
        })
        .catch((error: any) => {
          this.analytics.logEvent('auth_send_password_reset_failed', {username: this.form.get('username').value, error});
          this.showMessage(error.message, true);
          this.loading = false;
        });
  }

  async showMessage(message: string, error = false) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: error ? 'danger' : undefined
    });
    toast.present();
  }

}
