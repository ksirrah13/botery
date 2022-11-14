import { groupBy, mapValues } from 'lodash';
import dotenv from 'dotenv';
import { subDays } from 'date-fns';
import { CourtAlerts } from '../models/CourtAlerts';
import { getTimeSlots, runWithBrowser } from '../utils/puppeteer-helpers';
import {
  dateToDay,
  dateToTime,
  normalizedDay,
  normalizedTime,
  timeToDate,
  validForRange,
} from '../utils/time-helpers';
import { TimeSlot } from '../types';
import { DND_END, DND_START } from '../constants';
import { sendAlert } from '../utils/notifications';
import { runWithDbConnection } from '../db';

dotenv.config();

const runCheckForAlerts = async () => {
  const today = normalizedDay();
  const courtAlerts = await CourtAlerts.find({
    userId: 'kyle',
    status: 'new',
    date: { $gte: today },
  }).exec();

  if (courtAlerts.length === 0) {
    console.log('no alerts found to check');
    return;
  }

  const alertsByCourt = groupBy(courtAlerts, 'courtId');
  const datesByCourtId = mapValues(alertsByCourt, alerts =>
    alerts.map(alert => alert.date),
  );

  const resultsByCourtAndDate = await runWithBrowser(async browser => {
    const courtAndDateResults: Record<string, Record<string, TimeSlot[]>> = {};
    for (const courtId of Object.keys(datesByCourtId)) {
      const alertDates = datesByCourtId[courtId];
      const dateResults: Record<string, TimeSlot[]> = {};
      for (const date of alertDates) {
        console.log('checking for availability', {
          date: dateToDay(date),
          courtId,
        });
        const result = await getTimeSlots(
          browser,
          {
            courtId,
            date,
          },
          { filterByStatus: 'Available' },
        );
        dateResults[dateToDay(date)] = result;
        console.log('results', { date: dateToDay(date), courtId, result });
      }
      courtAndDateResults[courtId] = dateResults;
    }
    return courtAndDateResults;
  });

  for (const alert of courtAlerts) {
    const start = normalizedTime(alert.startTime);
    const end = normalizedTime(alert.endTime);
    const timeSlots = resultsByCourtAndDate[alert.courtId]?.[dateToDay(alert.date)];
    const filteredTimes = (timeSlots ?? [])
      .map(slot => timeToDate(slot.time))
      .filter(time => validForRange(start, end, time));
    if (filteredTimes.length > 0) {
      const stringTimes = filteredTimes.map(time => dateToTime(time));
      const { userId, courtId, date, startTime, endTime } = alert;
      console.log('Found available times! Sending alert!', {
        userId,
        courtId,
        date: dateToDay(date),
        start: dateToTime(startTime),
        end: dateToTime(endTime),
        foundTimes: stringTimes,
      });
      // TODO add users and alert recipients to db
      await sendAlert(
        [process.env.TEST_RECIPIENTS ?? ''],
        courtId,
        date,
        stringTimes,
      );
      await alert.updateOne({ status: 'alerted' });
    }
  }
};

export const cleanUpOldAlerts = async () => {
  // clean up old alerts from DB (greater than 2 weeks)
  const cleanUpThreshold = subDays(normalizedDay(), 14);
  console.log('running clean up for alerts', {
    threshold: dateToDay(cleanUpThreshold),
  });
  const { deletedCount } = await CourtAlerts.deleteMany({
    date: { $lte: cleanUpThreshold },
  });
  if (deletedCount) {
    console.log('cleaned up alerts', { deletedCount });
  }
};

export const runCheck = async () => {
  // await createTestData();
  if (process.env.ENABLE_DND === 'true') {
    // don't run or alert at night
    const currentTime = normalizedTime();
    if (currentTime > DND_START || currentTime < DND_END) {
      console.log('skipping check during DND time', {
        currentTime: dateToTime(currentTime),
        DND_START: dateToTime(DND_START),
        DND_END: dateToTime(DND_END),
      });
      return;
    }
  }
  await runCheckForAlerts();
  await cleanUpOldAlerts();
};

runWithDbConnection(() => runCheck());
