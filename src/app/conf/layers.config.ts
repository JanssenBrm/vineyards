import {Layer} from '../models/layer.model';

export const BACKGROUND_LAYERS: Layer[] = [
  {
    id: 'soil',
    label: 'Soil information',
    enabled: false,
    url: 'https://www.dov.vlaanderen.be/geoserver/wms',
    params: {
      layer: 'bodemkaart:bodemtypes'
    }
  }
];
