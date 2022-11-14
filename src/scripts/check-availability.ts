import { groupBy, mapValues } from 'lodash';
import dotenv from 'dotenv';
import { CourtAlerts } from '../models/CourtAlerts';
import { getTimeSlots, runWithBrowser } from '../utils/puppeteer-helpers';
import {
  parseDateToTimeString,
  parseTimeStringToDate,
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
    alerts.map(alert => alert.dateString),
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
    const start = parseTimeStringToDate(alert.timeStart);
    const end = parseTimeStringToDate(alert.timeEnd);
    const timeSlots = resultsByCourtAndDate[alert.courtId]?.[alert.dateString];
    const filteredTimes = timeSlots
      .map(slot => parseTimeStringToDate(slot.time))
      .filter(time => validForRange(start, end, time));
    if (filteredTimes.length > 0) {
      const stringTimes = filteredTimes.map(
        time => parseDateToTimeString(time) ?? '',
      );
      console.log('Found available times! Sending alert!', {
        userId: alert.userId,
        courtId: alert.courtId,
        date: alert.dateString,
        start: alert.timeStart,
        end: alert.timeEnd,
        foundTimes: stringTimes,
      });
      // TODO add users and alert recipients to db
      await sendAlert(
        [process.env.TEST_RECIPIENTS ?? ''],
        parseInt(alert.courtId, 10),
        alert.dateString,
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
    const adjustedTime = new Date();
    adjustedTime.setHours(adjustedTime.getUTCHours() - TIME_OFFSET);
    const currentHours = adjustedTime.getUTCHours();
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
