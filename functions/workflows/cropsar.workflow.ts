import { calculateAllCropSAR } from '../src/services/cropsar.service';
import { config } from 'dotenv';
import { initDb } from '../src/services/utils.service';
import { reloadOpenEOSettings } from '../src/services/openeo.service';
import { logger } from '../src/utils/logger.util';

config({
  path: '.env',
});

initDb(process.env.FB_SERVICE_ACCOUNT_FILE || '', process.env.FB_DATA_URL || '');
reloadOpenEOSettings();

calculateAllCropSAR().then(() => {
  logger.info('done');
});
