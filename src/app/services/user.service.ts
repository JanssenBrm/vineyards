import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserData } from '../../../functions/src/models/userdata.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private fireStore: AngularFirestore) {}

  public getUserInfo(userId: string) {
    return this.fireStore
      .collection<UserData>(`/users`)
      .doc(userId)
      .get()
      .pipe(map((doc) => doc.data()));
  }
}
