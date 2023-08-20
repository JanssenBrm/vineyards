import { Injectable } from '@angular/core';
import { auth, User } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { UserData, UserRole } from '../models/userdata.model';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { StripeService } from './stripe.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: BehaviorSubject<User>;

  private userData: BehaviorSubject<UserData>;

  private DELAY = 1000;

  constructor(
    public fbAuth: AngularFireAuth,
    public router: Router,
    private fireStore: AngularFirestore,
    private analytics: AngularFireAnalytics,
    private stripeService: StripeService
  ) {
    this.user = new BehaviorSubject<User>(undefined);
    this.userData = new BehaviorSubject<UserData>(undefined);
    this.fbAuth.authState
      .pipe(
        switchMap((user: User) => {
          if (user) {
            return this.readUserData(user).pipe(
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
          this.updateUser(user, data).then(() => {
            console.log('User updated');
          });
        } else {
          localStorage.removeItem('user');
        }
      });
  }

  public async updateUser(user: User, data: UserData): Promise<UserData> {
    const newData: UserData = {
      id: user.uid,
      name: user.displayName,
      role: data?.role || UserRole.BASIC,
      customerId: data?.customerId || '',
    };
    await this.fireStore.collection<UserData>('users').doc(user.uid).set(newData);
    return newData;
  }

  public readUserData(user: User): Observable<UserData> {
    return this.fireStore
      .collection<UserData>('users')
      .doc(user.uid)
      .get()
      .pipe(
        take(1),
        map((data: DocumentSnapshot<UserData>) => data.data()),
        switchMap((data: UserData) => (!data ? from(this.updateUser(user, null)) : of(data))),
        switchMap((data: UserData) =>
          data.customerId !== ''
            ? of(data)
            : from(
                this.stripeService.createCustomer(data, user.email).then((id) => ({
                  ...data,
                  customerId: id,
                }))
              ).pipe()
        ),
        catchError((error: any) => {
          console.error('Could not retrieve user data', error);
          return of(undefined);
        }),
        tap((data: UserData) => {
          this.userData.next(data);
        })
      );
  }

  getUserData(): BehaviorSubject<UserData> {
    return this.userData;
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
    setTimeout(() => {
      this.analytics.logEvent('auth_login_email_success', { username: email });
      this.router.navigate(['map']);
    }, this.DELAY);
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
    const user: auth.UserCredential = await this.fbAuth.signInWithPopup(new auth.GoogleAuthProvider());
    setTimeout(() => {
      this.analytics.logEvent('auth_login_google_success', { username: user.user.email });
      this.router.navigate(['map']);
    }, this.DELAY);
  }
}
