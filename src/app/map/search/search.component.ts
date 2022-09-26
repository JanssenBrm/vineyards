import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Suggestion } from '../../models/search.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  public suggestions: Observable<Suggestion[]>;

  @Output()
  public setLocation: EventEmitter<number[]> = new EventEmitter<number[]>();

  constructor(private http: HttpClient) {}

  searchQueryUpdated(query: string) {
    this.suggestions = this.getSuggestions(query);
  }

  private getSuggestions(query: string): Observable<Suggestion[]> {
    return this.http.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`).pipe(
      map((results: any) => {
        console.log(results);
        return results.map((r) => ({
          name: r.display_name,
          extent: [+r.boundingbox[2], +r.boundingbox[0], +r.boundingbox[3], +r.boundingbox[1]],
        }));
      })
    );
  }

  public zoomToLocation(extent: number[]) {
    this.setLocation.emit(extent);
  }
}
