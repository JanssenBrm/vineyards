import { Injectable } from '@angular/core';
import { auth, User } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserData } from '../models/userdata.model';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: BehaviorSubject<User>;

  constructor(
    public fbAuth: AngularFireAuth,
    public router: Router,
    private fireStore: AngularFirestore,
    private analytics: AngularFireAnalytics
  ) {
    this.user = new BehaviorSubject<User>(undefined);
    this.fbAuth.authState.subscribe((user: User) => {
      this.user.next(user);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.updateUser(user);
      } else {
        localStorage.removeItem('user');
      }
    });
  }

  private updateUser(user: User) {
    this.fireStore.collection<UserData>('users').doc(user.uid).set({
      id: user.uid,
      name: user.displayName,
    });
  }

  getUser(): BehaviorSubject<User> {
    return this.user;
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return !!user && user.emailVerified;
  }

  async login(email: string, password: string) {
    await this.fbAuth.signInWithEmailAndPassword(email, password);
    await setTimeout(() => {
      this.analytics.logEvent('auth_login_email_success', { username: email });
      this.router.navigate(['/map']);
    }, 500);
  }

  async register(email: string, password: string) {
    await this.fbAuth.createUserWithEmailAndPassword(email, password);
    this.analytics.logEvent('auth_register', { username: email });
    this.sendEmailVerification(email);
  }

  async sendEmailVerification(email?: string) {
    const user = await this.fbAuth.currentUser;
    await user.sendEmailVerification();
    this.analytics.logEvent('auth_send_email_verification', { username: email });
    this.router.navigate(['verify-email']);
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    this.analytics.logEvent('auth_send_password_reset', { username: passwordResetEmail });
    return this.fbAuth.sendPasswordResetEmail(passwordResetEmail);
  }

  async logout() {
    const user = await this.fbAuth.currentUser;
    const username = user.email;
    await this.fbAuth.signOut();
    localStorage.removeItem('user');
    await setTimeout(() => {
      this.analytics.logEvent('auth_logout_success', { username });
      this.router.navigate(['login']);
    }, 500);
  }

  async loginWithGoogle() {
    const user: auth.UserCredential = await this.fbAuth.signInWithPopup(new auth.GoogleAuthProvider());
    await setTimeout(() => {
      this.analytics.logEvent('auth_login_google_success', { username: user.user.email });
      this.router.navigate(['map']);
    }, 500);
  }
}
