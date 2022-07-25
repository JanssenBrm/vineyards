import * as functions from 'firebase-functions';
import {
  getUserEmail,
  getUsers,
  getVineyard,
  getVineyardActions,
  getVineyardLocation,
  getVineyards,
  getVineyardStats,
  saveMeteo,
} from './services/utils.service';
import { Vineyard } from './models/vineyard.model';
import { getMeteo, getMeteoDates } from './services/meteo.service';
import { MeteoStat } from './models/stats.model';
import { Warning, WarningType } from '../../src/app/models/warning.model';
import * as moment from 'moment';
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

exports.updateMeteoStats = functions.pubsub.schedule('0 0 * * *').onRun(async (context) => _updateMeteoStats());

export const _updateMeteoStats = async () => {
  const users: string[] = await getUsers();
  console.log(`Found ${users.length} users to process`);

  for (const uid of users) {
    const vineyards: string[] = await getVineyards(uid);
    console.log(`Found ${vineyards.length} vineyards for user ${uid}`);
    for (const id of vineyards) {
      try {
        const email: string | undefined = await getUserEmail(uid);
        const v: Vineyard = await getVineyard(uid, id);
        const location = getVineyardLocation(v);
        const actions = await getVineyardActions(uid, id);
        const stats = await getVineyardStats(uid, id);
        const dates: { start: moment.Moment; end: moment.Moment }[] = getMeteoDates(actions, stats);
        for (const date of dates) {
          console.log('Retrieving dates from ' + date.start + ' to ' + date.end);
          const newStats = await getMeteo(location[1], location[0], date.start, date.end);
          stats.data = [...stats.data, ...newStats.data];
        }
        stats.data = stats.data.sort((d1: MeteoStat, d2: MeteoStat) =>
          moment(d1.date).isBefore(moment(d2.date), 'day') ? -1 : 1
        );
        const warnings = _calculateWarnings(stats.data);
        if (warnings.length > 0 && email) {
          console.log('Sending email to ' + email);
          await _emailWarnings(email, v, warnings);
        }
        await saveMeteo(uid, id, stats);
      } catch (error) {
        console.error(`Error processing vineyard ${id} of ${uid}`, error);
      }
    }
  }
  return true;
};

export const _emailWarnings = (
  email: string,
  vineyard: Vineyard,
  warnings: { date: string; warnings: Warning[] }[]
): Promise<any> => {
  const msg: any = {
    to: email,
    from: process.env.emailSender,
    templateId: 'd-1386a8dba74b4f15a54403b38e7ddc88',
    dynamicTemplateData: {
      subject: `Warnings detected for ${vineyard.name}`,
      vineyard,
      warnings,
    },
  };

  return sgMail
    .send(msg)
    .then((response: any) => {
      console.log('Email sent', response[0].headers);
    })
    .catch((error: any) => {
      console.error('Error while sending email', error);
    });
};

const _calculateWarnings = (meteo: MeteoStat[]): { date: string; warnings: Warning[] }[] => {
  const warnings: Warning[] = [..._getFrostWarnings(meteo)];
  if (warnings.length > 0) {
    return warnings.reduce((list: { date: string; warnings: Warning[] }[], warning: Warning) => {
      const hit = list.find((l) => l.date === warning.date);
      if (hit) {
        hit.warnings.push(warning);
      } else {
        list.push({
          date: warning.date,
          warnings: [warning],
        });
      }
      return list;
    }, []);
  } else {
    return [];
  }
};

const _getFrostWarnings = (info: MeteoStat[]): Warning[] => {
  return info
    .filter((i: MeteoStat) => moment(i.date).isAfter(moment()))
    .filter((i: MeteoStat) => Math.round(i.tmin) < 0)
    .map((i: MeteoStat) => ({
      type: WarningType.FROST,
      date: i.date,
      description: `Freezing temperatures of ${Math.round(i.tmin)}°C detected`,
    }));
};
