import {Injectable} from '@angular/core';
import {auth, User} from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {VineyardDoc} from '../models/vineyarddoc.model';
import {UserData} from '../models/userdata.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private user: BehaviorSubject<User>;

    constructor(
        public fbAuth: AngularFireAuth, public router: Router,
        private fireStore: AngularFirestore,
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
            this.router.navigate(['/map']);
        }, 500);
    }

    async register(email: string, password: string) {
        const result = await this.fbAuth.auth.createUserWithEmailAndPassword(email, password);
        this.sendEmailVerification();
    }

    async sendEmailVerification() {
        await this.fbAuth.auth.currentUser.sendEmailVerification();
        this.router.navigate(['verify-email']);
    }

    async sendPasswordResetEmail(passwordResetEmail: string) {
        return await this.fbAuth.auth.sendPasswordResetEmail(passwordResetEmail);
    }

    async logout() {
        await this.fbAuth.auth.signOut();
        localStorage.removeItem('user');
        await setTimeout(() => {
            this.router.navigate(['login']);
        }, 500);
    }

    async loginWithGoogle() {
        await this.fbAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
        await setTimeout(() => {
           this.router.navigate(['map']);
        }, 500);
    }
}
