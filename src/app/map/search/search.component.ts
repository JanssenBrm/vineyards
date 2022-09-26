import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Suggestion } from '../../models/search.model';
import { IonSearchbar } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  public suggestions: Observable<Suggestion[]>;

  public loading: boolean = false;

  public query: string = '';

  @ViewChild('searchbar')
  searchBar: IonSearchbar;

  @Output()
  public setLocation: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor(private http: HttpClient) {}

  searchQueryUpdated(query: string) {
    if (query !== '') {
      this.suggestions = this.getSuggestions(query);
    } else {
      this.suggestions = of([]);
    }
  }

  public zoomToLocation(extent: number[]) {
    this.setLocation.emit(extent);
    this.searchBar.value = '';
  }

  private getSuggestions(query: string): Observable<Suggestion[]> {
    this.loading = true;
    return this.http.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`).pipe(
      map((results: any) => {
        this.loading = false;
        return results.map((r) => ({
          name: r.display_name,
          extent: [+r.boundingbox[2], +r.boundingbox[0], +r.boundingbox[3], +r.boundingbox[1]],
        }));
      })
    );
  }
}
