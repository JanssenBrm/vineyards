import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { User } from 'firebase';
import { AuthService } from './auth.service';
import { Integration, IntegrationType } from '../models/integration.model';

@Injectable({
  providedIn: 'root',
})
export class IntegrationsService {
  private _integrationCollection: AngularFirestoreCollection<Integration[]>;

  private _integrations: BehaviorSubject<Integration[]>;

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {
    this._integrations = new BehaviorSubject<Integration[]>([]);
    this.authService.getUser().subscribe((user: User) => {
      if (user) {
        this._integrationCollection = fireStore.collection<Integration[]>(`users/${user.uid}/integrations`);
      }
    });
  }

  public getIntegrationListener(): BehaviorSubject<Integration[]> {
    return this._integrations;
  }

  public getIntegrations(vineyard: Vineyard): void {
    this._integrationCollection
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<Integration[]>[]) => (data ? data[0] : undefined)),
        map((docs: DocumentChangeAction<Integration[]>) => [].concat(docs.payload.doc.data() ?? [])),
        map((integrations: Integration[]) =>
          integrations.filter((i: Integration) => (i.vineyards || []).includes(vineyard.id))
        )
      )
      .subscribe((integrations: Integration[]) => this._integrations.next(integrations));
  }

  public getIntegration(type: IntegrationType): Integration {
    return this._integrations.value.find((i: Integration) => i.type === type);
  }

  public hasIntegration(type: IntegrationType): boolean {
    return !!this.getIntegration(type);
  }
}
