import { logger } from '../utils/logger.util';

let OPENEO_URL: string;
let OPENEO_USER: string;
let OPENEO_PASSWORD: string;

let AUTH_TOKEN: string;

export const reloadOpenEOSettings = () => {
  OPENEO_URL = process.env.OPENEO_URL || '';
  OPENEO_USER = process.env.OPENEO_USER || '';
  OPENEO_PASSWORD = process.env.OPENEO_PASSWORD || '';
};
reloadOpenEOSettings();

const authenticate = async (username: string, password: string): Promise<string> => {
  try {
    const response: any = await fetch(`${OPENEO_URL}/credentials/basic`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    return `basic//${data.access_token}`;
  } catch (e) {
    logger.error('Could not authenticate with OpenEO', e);
    throw new Error('Could not authenticate with OpenEO service');
  }
};

const getToken = async (): Promise<string> => {
  if (!AUTH_TOKEN) {
    AUTH_TOKEN = await authenticate(OPENEO_USER, OPENEO_PASSWORD);
  }
  return AUTH_TOKEN;
};

const getHeaders = async (): Promise<any> => {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};
export const executeGraphSync = async (graph: any, format: string): Promise<any> => {
  const headers = await getHeaders();
  const response = await fetch(`${OPENEO_URL}/result`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      log_level: 'debug',
      process: {
        process_graph: graph,
      },
    }),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (format === 'json') {
    return response.json();
  } else {
    throw new Error(`Unknown output format ${format}`);
  }
};
