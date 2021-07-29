import {Injectable} from '@angular/core';
import {auth, User} from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {UserData} from '../models/userdata.model';
import {AngularFireAnalytics} from '@angular/fire/analytics';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private user: BehaviorSubject<User>;

    constructor(
        public fbAuth: AngularFireAuth, public router: Router,
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
        this.fireStore.collection<UserData>('users')
            .doc(user.uid)
            .set({
                id: user.uid,
                name: user.displayName
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
        const result = await this.fbAuth.auth.signInWithEmailAndPassword(email, password);
        await setTimeout(() => {
            this.analytics.logEvent('auth_login_email_success', {username: email});
            this.router.navigate(['/map']);
        }, 500);
    }

    async register(email: string, password: string) {
        const result = await this.fbAuth.auth.createUserWithEmailAndPassword(email, password);
        this.analytics.logEvent('auth_register', {username: email});
        this.sendEmailVerification(email);
    }

    async sendEmailVerification(email?: string) {
        await this.fbAuth.auth.currentUser.sendEmailVerification();
        this.analytics.logEvent('auth_send_email_verification', {username: email});
        this.router.navigate(['verify-email']);
    }

    async sendPasswordResetEmail(passwordResetEmail: string) {
        this.analytics.logEvent('auth_send_password_reset', {username: passwordResetEmail});
        return await this.fbAuth.auth.sendPasswordResetEmail(passwordResetEmail);
    }

    async logout() {
        const username = this.fbAuth.auth.currentUser.email;
        await this.fbAuth.auth.signOut();
        localStorage.removeItem('user');
        await setTimeout(() => {
            this.analytics.logEvent('auth_logout_success', {username});
            this.router.navigate(['login']);
        }, 500);
    }

    async loginWithGoogle() {
        const user: auth.UserCredential = await this.fbAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
        await setTimeout(() => {
            this.analytics.logEvent('auth_login_google_success', {username: user.user.email});
            this.router.navigate(['map']);
        }, 500);
    }
}
