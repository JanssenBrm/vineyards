import { LngLat } from 'mapbox-gl';

export interface Layer {
  id: string;
  label: string;
  enabled: boolean;
  url: string;
  click?: (coordinates: LngLat) => Promise<string>;
}
