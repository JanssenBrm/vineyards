import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { Vineyard } from '../models/vineyard.model';
import { Vintage } from '../models/vintage.model';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VintageService {
  private _vintages: BehaviorSubject<Vintage[]>;

  constructor(private fireStore: AngularFirestore) {
    this._vintages = new BehaviorSubject<Vintage[]>([]);
  }

  private getVineyardVintagesCollectionPath(vineyard: Vineyard): string {
    return `users/${vineyard.owner}/vineyards/${vineyard.id}/vintages`;
  }

  public getVintageListener(): BehaviorSubject<Vintage[]> {
    return this._vintages;
  }

  public async addVintage(vineyard: Vineyard, vintage: Vintage): Promise<void> {
    await this.fireStore.collection<Vintage>(this.getVineyardVintagesCollectionPath(vineyard)).add(vintage);
  }

  public async updateVintage(vineyard: Vineyard, vintage: Vintage): Promise<void> {
    await this.fireStore
      .collection<Vintage>(this.getVineyardVintagesCollectionPath(vineyard))
      .doc(vintage.id)
      .set(vintage);
  }

  public async removeVintage(vineyard: Vineyard, vintage: Vintage): Promise<void> {
    await this.fireStore.collection<Vintage>(this.getVineyardVintagesCollectionPath(vineyard)).doc(vintage.id).delete();
  }

  public getVintages(vineyard: Vineyard): void {
    this.fireStore
      .collection<Vintage>(this.getVineyardVintagesCollectionPath(vineyard))
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<Vintage>[]) =>
          data.map((d: DocumentChangeAction<Vintage>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        ),
        map((vintages: Vintage[]) => vintages.sort((v1: Vintage, v2: Vintage) => (v1.year > v2.year ? -1 : 1)))
      )
      .subscribe((vintages: Vintage[]) => this._vintages.next(vintages));
  }
}
