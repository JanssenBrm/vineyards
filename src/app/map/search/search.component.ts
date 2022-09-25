import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, PlaceAutocompleteResponse, PlaceAutocompleteResult } from '@googlemaps/google-maps-services-js';
import { PlaceAutocompleteType } from '@googlemaps/google-maps-services-js/src/places/autocomplete';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  public suggestions: Observable<string[]>;

  private client: Client;

  constructor(private http: HttpClient) {
    this.client = new Client({});
  }

  searchQueryUpdated(query: string) {
    this.suggestions = this.getSuggestions(query);
  }

  private getSuggestions(query: string): Observable<string[]> {
    return from(
      this.client.placeAutocomplete({
        params: {
          input: query,
          key: environment.places_api_key,
          types: PlaceAutocompleteType.geocode,
          language: 'en',
        },
      })
    ).pipe(
      map((response: PlaceAutocompleteResponse) =>
        response.data.predictions.map((p: PlaceAutocompleteResult) => p.description)
      )
    );
  }
}
