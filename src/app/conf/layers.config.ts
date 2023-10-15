import { Layer } from '../models/layer.model';
import { LngLat } from 'mapbox-gl';
import buffer from '@turf/buffer';
import bbox from '@turf/bbox';

export const BACKGROUND_LAYERS: Layer[] = [
  {
    id: 'soil',
    label: 'Soil information',
    enabled: false,
    url: 'https://www.dov.vlaanderen.be/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=bodemkaart%3Abodemtypes&TILED=true&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&bbox={bbox-epsg-3857}',
    click: async (coordinates: LngLat) => {
      const bb = bbox(
        buffer(
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coordinates.toArray().reverse(),
            },
            properties: {},
          },
          10,
          { units: 'meters' }
        )
      );
      const response = await fetch(`
https://www.dov.vlaanderen.be/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=bodemkaart%3Abodemtypes&LAYERS=bodemkaart%3Abodemtypes&TILED=true&INFO_FORMAT=application%2Fjson&I=225&J=84&WIDTH=256&HEIGHT=256&CRS=EPSG%3A4326&STYLES=&BBOX=${bb.join(
        ','
      )}`);
      const data = await response.json();
      return data.features[0].properties.Beknopte_omschrijving_bodemserie;
    },
  },
  {
    id: 'irradiance',
    label: 'Irriadiance',
    enabled: false,
    url: 'https://remote-sensing.be/geoserver/VEA/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=LiDAR_DHMV_II_25CM_YearlyIrradianceTotal&TILED=true&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&STYLES=&BBOX={bbox-epsg-3857}',
  },
];
