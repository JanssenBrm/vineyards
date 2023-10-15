import { Layer } from '../models/layer.model';

export const BACKGROUND_LAYERS: Layer[] = [
  {
    id: 'soil',
    label: 'Soil information',
    enabled: false,
    url: 'https://www.dov.vlaanderen.be/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=bodemkaart%3Abodemtypes&TILED=true&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&bbox={bbox-epsg-3857}',
    click: (data: any) => data.features[0].properties.Beknopte_omschrijving_bodemserie,
  },
  {
    id: 'irradiance',
    label: 'Irriadiance',
    enabled: false,
    url: 'https://remote-sensing.be/geoserver/VEA/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=LiDAR_DHMV_II_25CM_YearlyIrradianceTotal&TILED=true&WIDTH=256&HEIGHT=256&CRS=EPSG%3A3857&STYLES=&BBOX={bbox-epsg-3857}',
  },
];
