import {Layer} from '../models/layer.model';

export const BACKGROUND_LAYERS: Layer[] = [
  {
    id: 'soil',
    label: 'Soil information',
    enabled: false,
    url: 'https://www.dov.vlaanderen.be/geoserver/wms',
    params: {
      layer: 'bodemkaart:bodemtypes'
    },
    click: (data: any) => data.features[0].properties.Beknopte_omschrijving_bodemserie
  },
  {
    id: 'irradiance',
    label: 'Irriadiance',
    enabled: false,
    url: 'https://remote-sensing.be/geoserver/VEA/wms',
    params: {
      layer: 'LiDAR_DHMV_II_25CM_YearlyIrradianceTotal'
    }
  }
];
