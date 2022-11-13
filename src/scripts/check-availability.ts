import { groupBy, keyBy, mapValues } from 'lodash';
import { CourtAlerts } from '../models/CourtAlerts';
import { getTimeSlots, runWithBrowser } from '../utils/puppeteer-helpers';
import { parseDateToString, parseStringToDate, validForRange } from '../utils/dates';
import { AlertResults } from '../types';

const runCheckForUser = async () => {
  // get configured checks for user
  const courtAlerts = await CourtAlerts.find({
    userId: 'kyle',
    status: 'new',
  })
    .select('courtId date timeStart timeEnd')
    .lean()
    .exec();
  // check if we've already alerted and should keep checking
  // only alert once for each court and date
  // get time slots for courts and dates
  const alertsByCourt = groupBy(courtAlerts, 'courtId');
  const timeSlotResults: AlertResults[] = [];

  for (const courtId of Object.keys(alertsByCourt)) {
    const alertsPerCourt = alertsByCourt[courtId];

    const alertsByDate = groupBy(alertsPerCourt, 'date');

    for (const alertDate of Object.keys(alertsByDate)) {
      const courtToNumber = parseInt(courtId, 10);
      timeSlotResults.push({ courtId: courtToNumber, date: alertDate, slots: [] });
    }
  }

  // TODO build new time slot data and resturn don't mutate
  await runWithBrowser(async browser => {
    for (const alertToCheck of timeSlotResults) {
      console.log('getting time slots', alertToCheck);
      const result = await getTimeSlots(
        browser,
        {
          courtId: alertToCheck.courtId,
          date: alertToCheck.date,
        },
        { filterByStatus: 'Available' },
      );
      alertToCheck.slots = result;
    }
  });

  const resultsGroupedByCourt = groupBy(timeSlotResults, 'courtId');
  const resultsByCourtAndDate = mapValues(resultsGroupedByCourt, resultsForCourt =>
    keyBy(resultsForCourt, 'date'),
  );

  for (const alert of courtAlerts) {
    console.log('testing', { alert });
    const start = parseStringToDate(alert.timeStart);
    const end = parseStringToDate(alert.timeEnd);
    const timeSlots = resultsByCourtAndDate[alert.courtId]?.[alert.date];
    const filteredTimes = timeSlots.slots
      .map(slot => parseStringToDate(slot.time))
      .filter(time => validForRange(start, end, time));
    const stringTimes = filteredTimes.map(time => parseDateToString(time));
    if (stringTimes.length > 0) {
      console.log('found times', { alert, stringTimes });
    }
  }
};

export const runCheck = async () => {
  // await createTestData();
  await runCheckForUser();
};
