import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { User } from 'firebase';
import { UtilService } from '../services/util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnInit {
  public user: BehaviorSubject<User>;

  constructor(public authService: AuthService, private router: Router, public utilService: UtilService) {}

  ngOnInit() {
    this.user = this.authService.getUser();
  }

  async toLogin() {
    await this.authService.logout();
    await this.router.navigate(['login']);
  }
}
