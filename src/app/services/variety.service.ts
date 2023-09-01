import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentReference } from '@angular/fire/firestore';
import { Vineyard } from '../models/vineyard.model';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Action, ActionType, PlantingAction } from '../models/action.model';
import { Variety } from '../models/variety.model';
import { Vintage } from '../models/vintage.model';
import { ActionService } from './action.service';

@Injectable({
  providedIn: 'root',
})
export class VarietyService {
  private _varieties: BehaviorSubject<Variety[]>;

  constructor(private fireStore: AngularFirestore, private actionService: ActionService) {
    this._varieties = new BehaviorSubject<Variety[]>([]);
  }

  public getVarietyListener(): BehaviorSubject<Variety[]> {
    return this._varieties;
  }

  private getVineyardVarietiesCollectionPath(vineyard: Vineyard): string {
    return `users/${vineyard.owner}/vineyards/${vineyard.id}/varieties`;
  }

  public addVariety(vineyard: Vineyard, variety: Variety): Promise<string> {
    return this.fireStore
      .collection<Variety>(this.getVineyardVarietiesCollectionPath(vineyard))
      .add(variety)
      .then((doc: DocumentReference) => doc.id);
  }

  public getVarietyByName(name: string): Variety {
    return this._varieties.getValue().find((v: Variety) => v.name === name);
  }

  public getVarietyByID(id: string): Variety {
    return this._varieties.getValue().find((v: Variety) => v.id === id);
  }

  public getVarieties(vineyard: Vineyard): void {
    this.fireStore
      .collection<Variety>(this.getVineyardVarietiesCollectionPath(vineyard))
      .snapshotChanges()
      .pipe(
        map((data: DocumentChangeAction<Variety>[]) =>
          data.map((d: DocumentChangeAction<Variety>) => ({
            ...d.payload.doc.data(),
            id: (d.payload.doc as any).id,
          }))
        )
      )
      .subscribe((actions: Variety[]) => this._varieties.next(actions));
  }

  public getPlantCount(varieties: Variety[]): number {
    const ids = varieties.map((v: Variety) => v.id);
    const actions: PlantingAction[] = this.actionService
      .getActionListener()
      .getValue()
      .filter((a: Action) => a.type === ActionType.Planting && ids.includes(a.variety[0])) as PlantingAction[];
    return varieties.length > 0
      ? []
          .concat(
            ...varieties.map((v: Variety) =>
              actions
                .filter((a: PlantingAction) => a.variety[0] === v.id)
                .map((a: PlantingAction) => a.plantsPerRow * a.rows)
            )
          )
          .reduce((sum: number, count: number) => sum + count, 0)
      : 0;
  }

  getVariety(ids: string[]): Variety[] {
    return this._varieties.getValue().filter((v: Variety) => ids.indexOf(v.id) >= 0);
  }

  getVarietiesLabel(action: Action): string {
    return this.getVariety(action.variety)
      .map((v: Variety) => v.name)
      .join(', ');
  }

  getVintageVarietiesLabel(vintage: Vintage): string {
    return vintage.varieties.map((v: string) => this.getVarietyByID(v).name).join(',');
  }
}
