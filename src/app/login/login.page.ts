import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UtilService } from '../services/util.service';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public form: FormGroup;

  public loading = false;

  constructor(
    public authService: AuthService,
    public toastController: ToastController,
    public router: Router,
    public utilService: UtilService,
    private analytics: AngularFireAnalytics
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
    this.loading = false;

    this.authService.getUser().subscribe({
      next: (user) => {
        if (user && user.emailVerified) {
          if (user.emailVerified) {
            this.router.navigate(['map']);
          } else {
            this.router.navigate(['verify-email']);
          }
          this.loading = false;
        }
      },
    });
  }

  login() {
    this.loading = true;
    this.authService
      .login(this.form.get('username').value, this.form.get('password').value)
      .catch(async (error: any) => {
        await this.analytics.logEvent('user_login_error', { username: this.form.get('username'), error });
        await this.showError(error.message);
        this.loading = false;
      });
  }

  loginWithGoogle() {
    this.loading = true;
    this.authService.loginWithGoogle().catch(async (error: any) => {
      await this.showError(error.message);
      this.loading = false;
    });
  }

  async showError(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: 'danger',
    });
    await toast.present();
  }
}
