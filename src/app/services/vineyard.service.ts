import { Polygon } from 'ol/geom';
import { SharedVineyardDoc, VineyardDoc, VineyardPermissionsDoc } from '../models/vineyarddoc.model';
import { Vineyard, VineyardPermissions } from '../models/vineyard.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentChangeAction,
  DocumentReference,
} from '@angular/fire/firestore';
import { GeoJSON } from 'ol/format';
import { AuthService } from './auth.service';
import { User } from 'firebase';
import { getCenter } from 'ol/extent';
import { transformExtent } from 'ol/proj';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class VineyardService {
  private _vineyards$: BehaviorSubject<Vineyard[]>;

  private _activeVineyard$: BehaviorSubject<Vineyard>;

  private _activeSeasons$: BehaviorSubject<number[]>;

  private _vineyardsLoading$: BehaviorSubject<boolean>;

  private _vineyardCollection: AngularFirestoreCollection<VineyardDoc>;

  private _sharedVineyardCollection: AngularFirestoreCollection<SharedVineyardDoc>;

  private _userId: string;

  constructor(private fireStore: AngularFirestore, private authService: AuthService, private userService: UserService) {
    this._vineyards$ = new BehaviorSubject<Vineyard[]>([]);
    this._activeVineyard$ = new BehaviorSubject<Vineyard>(null);
    this._activeSeasons$ = new BehaviorSubject<number[]>([new Date().getFullYear()]);
    this._vineyardsLoading$ = new BehaviorSubject<boolean>(false);

    this.authService.getUser().subscribe((user: User) => {
      if (user) {
        this._userId = user.uid;
        this._vineyardCollection = fireStore.collection<VineyardDoc>(`users/${this._userId}/vineyards`);
        this._sharedVineyardCollection = fireStore.collection<SharedVineyardDoc>(
          `users/${this._userId}/sharedVineyards`
        );
        this.getVineyards();
      } else {
        this._userId = undefined;
        this._vineyards$.next([]);
      }
    });
  }

  getIsVineyardsLoading(): Observable<boolean> {
    return this._vineyardsLoading$;
  }

  getVineyardsListener(): Observable<Vineyard[]> {
    return this._vineyards$;
  }

  getActiveVineyard(): Observable<Vineyard> {
    return this._activeVineyard$;
  }

  getActiveSeasons(): Observable<number[]> {
    return this._activeSeasons$;
  }

  setActiveSeasons(seasons: number[]): void {
    this._activeSeasons$.next(seasons);
  }

  getVineyards(): void {
    this._vineyardsLoading$.next(true);
    combineLatest(this.getUserVineyards(), this.getSharedVineyards())
      .pipe(
        map(([owned, shared]) => [...owned, ...shared]),
        map((docs: VineyardDoc[]) =>
          docs.map((d: VineyardDoc) => ({
            ...d,
            location: new Polygon(JSON.parse(d.location).coordinates).transform('EPSG:4326', 'EPSG:3857'),
          }))
        ),
        // tap((vineyards: Vineyard[]) => forkJoin(vineyards.map((v: Vineyard) => this.updateTempStats(v))).subscribe()),
        map((vineyards: Vineyard[]) =>
          vineyards.map((v: Vineyard) => ({
            ...v,
          }))
        )
      )
      .subscribe({
        next: (vineyards: Vineyard[]) => {
          this._vineyards$.next(vineyards);
          this._vineyardsLoading$.next(false);
        },
        error: (error: any) => {
          console.error(`Something went wrong while fetching vineyards for user ${this._userId}`, error);
          this._vineyardsLoading$.next(false);
        },
      });
  }

  private getUserVineyards(): Observable<Vineyard[]> {
    return this._userId
      ? this._vineyardCollection.snapshotChanges().pipe(
          map((data: DocumentChangeAction<VineyardDoc>[]) =>
            data.map((d: DocumentChangeAction<VineyardDoc>) => ({
              ...d.payload.doc.data(),
              id: (d.payload.doc as any).id,
              shared: false,
              permissions: VineyardPermissions.OWNER,
              owner: this._userId,
            }))
          ),
          catchError((error) => {
            console.error(`Error while retrieving vineyards of user ${this._userId}`, error);
            return of([]);
          })
        )
      : of([]);
  }

  private getSharedVineyards(): Observable<Vineyard[]> {
    return this._userId
      ? this._sharedVineyardCollection.snapshotChanges().pipe(
          map((data: DocumentChangeAction<SharedVineyardDoc>[]) =>
            data.map((d: DocumentChangeAction<SharedVineyardDoc>) => d.payload.doc.data())
          ),
          switchMap((shared: SharedVineyardDoc[]) =>
            (shared.length > 0
              ? forkJoin(
                  shared.map((s: SharedVineyardDoc) =>
                    forkJoin(
                      // Fetch the shared vineyard
                      this.fireStore.collection<VineyardDoc>(`users/${s.user}/vineyards`).doc(s.vineyard).get(),
                      // Fetch the permissions on the shared vineyard
                      this.fireStore
                        .collection<VineyardDoc>(`users/${s.user}/vineyards/${s.vineyard}/permissions/`)
                        .doc(this._userId)
                        .get()
                        .pipe(
                          map((doc) => (doc.data() as VineyardPermissionsDoc).permissions),
                          catchError((error) => {
                            console.error(
                              `Could not fetch permissions for user ${this._userId} on vineyard ${s.vineyard} of user ${s.user}`,
                              error
                            );
                            return of(VineyardPermissions.NONE);
                          })
                        ),
                      // Get the user data of the vineyard owner
                      this.userService.getUserInfo(s.user)
                    ).pipe(
                      map(([doc, permissions, user]) => ({
                        ...doc.data(),
                        id: doc.id,
                        shared: true,
                        permissions: permissions,
                        owner: s.user,
                        ownerName: user.name,
                      })),
                      catchError((error: any) => {
                        console.error(`Cannot open vineyard ${s.vineyard}`, error);
                        return of(undefined);
                      })
                    )
                  )
                )
              : of([])
            ).pipe(map((docs) => docs.filter((d) => !!d && d.permissions !== VineyardPermissions.NONE)))
          ),
          catchError((error) => {
            console.error(`Failed to retrieved shared vineyards for user ${this._userId}`, error);
            return of([]);
          })
        )
      : of([]);
  }

  getInfo(id: string): Vineyard {
    return this._vineyards$.getValue().find((v: Vineyard) => v.id === id);
  }

  updateLocation(id: string, geometry: Polygon): void {
    const polygons = this._vineyards$.getValue().map((v: Vineyard) =>
      v.id === id
        ? {
            ...v,
            location: geometry,
          }
        : v
    );
    this._vineyards$.next(polygons);
  }

  saveVineyards(ids: string[]) {
    const geoJSON = new GeoJSON();
    this._vineyards$
      .getValue()
      .filter((v: Vineyard) => ids.indexOf(v.id) >= 0)
      .map((v: Vineyard) => ({
        ...v,
        location: new Polygon(v.location.getCoordinates()).transform('EPSG:3857', 'EPSG:4326'),
      }))
      .map((v: Vineyard) => ({
        ...v,
        location: geoJSON.writeGeometry(v.location),
      }))
      .forEach((d: VineyardDoc) => this._vineyardCollection.doc(d.id).set(d));
  }

  async addVineyard(name: string, address: string, location: Polygon): Promise<DocumentReference> {
    const geoJSON = new GeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    return this._vineyardCollection.add({
      name,
      address,
      location: geoJSON.writeGeometry(location),
      actions: [],
      varieties: [],
    });
  }

  async deleteVineyard(id: string): Promise<void> {
    await this._vineyardCollection.doc(id).delete();
    const vineyards: Vineyard[] = this._vineyards$.getValue().filter((v: Vineyard) => v.id !== id);
    this._vineyards$.next(vineyards);
  }

  getLocation(vineyard: Vineyard): [number, number] {
    return getCenter(transformExtent(vineyard.location.getExtent(), 'EPSG:3857', 'EPSG:4326'));
  }
}
