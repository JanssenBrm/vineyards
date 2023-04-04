import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserData, UserRole } from '../models/userdata.model';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';
import firebase from 'firebase/compat';
import { GoogleAuthProvider } from 'firebase/auth';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: BehaviorSubject<firebase.User>;

  private userData: BehaviorSubject<UserData>;

  private DELAY = 1000;

  constructor(
    public fbAuth: AngularFireAuth,
    public router: Router,
    private fireStore: AngularFirestore,
    private analytics: AngularFireAnalytics
  ) {
    this.user = new BehaviorSubject<firebase.User>(undefined);
    this.userData = new BehaviorSubject<UserData>(undefined);
    this.fbAuth.authState
      .pipe(
        switchMap((user: firebase.User) => {
          if (user) {
            return this.readUserData(user.uid).pipe(
              map((data: UserData) => ({
                user,
                data,
              }))
            );
          } else {
            return of({ user, data: undefined });
          }
        })
      )
      .subscribe(({ user, data }) => {
        this.user.next(user);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.updateUser(user, data?.role).then(() => {
            console.log('User updated', user);
          });
          this.router.navigate(['map']);
        } else {
          localStorage.removeItem('user');
        }
      });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return !!user && user.emailVerified;
  }

  getUserData(): BehaviorSubject<UserData> {
    return this.userData;
  }

  getUser(): BehaviorSubject<firebase.User> {
    return this.user;
  }

  async login(email: string, password: string) {
    await this.fbAuth.signInWithEmailAndPassword(email, password);
    await this.analytics.logEvent('auth_login_email_success', { username: email });
  }

  async register(email: string, password: string) {
    await this.fbAuth.createUserWithEmailAndPassword(email, password);
    await this.analytics.logEvent('auth_register', { username: email });
    await this.sendEmailVerification(email);
  }

  async sendEmailVerification(email?: string) {
    const user = await this.fbAuth.currentUser;
    await user.sendEmailVerification();
    await this.analytics.logEvent('auth_send_email_verification', { username: email });
    await this.router.navigate(['verify-email']);
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    await this.analytics.logEvent('auth_send_password_reset', { username: passwordResetEmail });
    return this.fbAuth.sendPasswordResetEmail(passwordResetEmail);
  }

  async logout() {
    const user = await this.fbAuth.currentUser;
    const username = user.email;
    await this.fbAuth.signOut();
    localStorage.removeItem('user');
    setTimeout(() => {
      this.analytics.logEvent('auth_logout_success', { username });
      this.router.navigate(['login']);
    }, this.DELAY);
  }

  async loginWithGoogle() {
    const user: firebase.auth.UserCredential = await this.fbAuth.signInWithPopup(new GoogleAuthProvider());
    setTimeout(() => {
      this.analytics.logEvent('auth_login_google_success', { username: user.user.email });
      this.router.navigate(['map']);
    }, 500);
  }

  private async updateUser(user: firebase.User, role: UserRole) {
    await this.fireStore
      .collection<UserData>('users')
      .doc(user.uid)
      .set({
        id: user.uid,
        name: user.displayName,
        role: role || UserRole.BASIC,
      });
  }

  private readUserData(uid: string): Observable<UserData> {
    return this.fireStore
      .collection<UserData>('users')
      .doc(uid)
      .get()
      .pipe(
        take(1),
        map((data: firebase.firestore.DocumentSnapshot<UserData>) => data.data()),
        catchError((error: any) => {
          console.error('Could not retrieve user data', error);
          return of(undefined);
        }),
        tap((data: UserData) => {
          this.userData.next(data);
        })
      );
  }
}
