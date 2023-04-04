import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { UtilService } from '../services/util.service';
import firebase from 'firebase/compat';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
})
export class VerifyEmailPage implements OnInit {
  public user: BehaviorSubject<firebase.User>;

  constructor(public authService: AuthService, public utilService: UtilService) {}

  ngOnInit() {
    this.user = this.authService.getUser();
  }
}
