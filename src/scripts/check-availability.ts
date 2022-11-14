import { groupBy, mapValues } from 'lodash';
import dotenv from 'dotenv';
import { CourtAlerts } from '../models/CourtAlerts';
import { getTimeSlots, runWithBrowser } from '../utils/puppeteer-helpers';
import {
  parseDateToString,
  parseStringToDate,
  validForRange,
} from '../utils/time-helpers';
import { TimeSlot } from '../types';
import { DND_END, DND_START, TIME_OFFSET } from '../constants';
import { sendAlert } from '../utils/notifications';
import { runWithDbConnection } from '../db';

dotenv.config();

const runCheckForAlerts = async () => {
  const courtAlerts = await CourtAlerts.find({
    userId: 'kyle',
    status: 'new',
  }).exec();

  const alertsByCourt = groupBy(courtAlerts, 'courtId');
  const datesByCourtId = mapValues(alertsByCourt, alerts =>
    alerts.map(alert => alert.date),
  );

  const resultsByCourtAndDate = await runWithBrowser(async browser => {
    const courtAndDateResults: Record<string, Record<string, TimeSlot[]>> = {};
    for (const courtIdString of Object.keys(datesByCourtId)) {
      const courtId = parseInt(courtIdString, 10);
      const alertDates = datesByCourtId[courtId];
      const dateResults: Record<string, TimeSlot[]> = {};
      for (const date of alertDates) {
        console.log('checking for availability', { date, courtId });
        const result = await getTimeSlots(
          browser,
          {
            courtId,
            date,
          },
          { filterByStatus: 'Available' },
        );
        dateResults[date] = result;
        console.log('results', { date, courtId, result });
      }
      courtAndDateResults[courtIdString] = dateResults;
    }
    return courtAndDateResults;
  });

  for (const alert of courtAlerts) {
    const start = parseStringToDate(alert.timeStart);
    const end = parseStringToDate(alert.timeEnd);
    const timeSlots = resultsByCourtAndDate[alert.courtId]?.[alert.date];
    const filteredTimes = timeSlots
      .map(slot => parseStringToDate(slot.time))
      .filter(time => validForRange(start, end, time));
    if (filteredTimes.length > 0) {
      const stringTimes = filteredTimes.map(time => parseDateToString(time) ?? '');
      console.log('Found available times! Sending alert!', {
        userId: alert.userId,
        courtId: alert.courtId,
        date: alert.date,
        start: alert.timeStart,
        end: alert.timeEnd,
        foundTimes: stringTimes,
      });
      // TODO add users and alert recipients to db
      await sendAlert(
        [process.env.TEST_RECIPIENTS ?? ''],
        parseInt(alert.courtId, 10),
        alert.date,
        stringTimes,
      );
      await alert.updateOne({ status: 'alerted' });
    }
  }
};

export const runCheck = async () => {
  // await createTestData();
  if (process.env.ENABLE_DND === 'true') {
    // don't run or alert at night
    const currentHours = new Date().getUTCHours() - TIME_OFFSET;
    if (currentHours >= DND_START || currentHours < DND_END) {
      console.log('skipping check during DND time', {
        currentHours,
        DND_START,
        DND_END,
      });
      return;
    }
  }
  await runCheckForAlerts();
};

runWithDbConnection(() => runCheck());
