import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Platform, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {UtilService} from '../services/util.service';

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
      public utilService: UtilService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  login() {
    this.loading = true;
    this.authService.login(this.form.get('username').value, this.form.get('password').value)
        .catch((error: any) => {
          this.showError(error.message);
          this.loading = false;
        });
  }

  loginWithGoogle() {
    this.loading = true;
    this.authService.loginWithGoogle()
        .catch((error: any) => {
          this.showError(error.message);
          this.loading = false;
        });
  }

  signUp() {
    this.router.navigate(['register']);
  }

  async showError(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: 'danger'
    });
    toast.present();
  }

}
