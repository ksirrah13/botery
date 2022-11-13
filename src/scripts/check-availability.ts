import { groupBy, keyBy, mapValues } from 'lodash';
import { COURTS } from '../constants';
import { CourtAlerts } from '../models/CourtAlerts';
import { TimeSlot } from '../types';
import { getTimeSlots, runWithBrowser } from '../utils';

const courtIds = [COURTS.HAMILTON_1, COURTS.HAMILTON_2];
const dates = ['11/13/2022', '11/14/2022'];
const timeRange = ['5:00 PM', '9:30 PM'];
const users = ['kyle'];

const createTestData = async () => {
  for (const court of courtIds) {
    for (const date of dates) {
      for (const user of users) {
        await CourtAlerts.findOneAndUpdate(
          { userId: user, courtId: court, date, status: 'new' },
          {
            userId: user,
            courtId: court,
            date,
            status: 'new',
            timeStart: timeRange[0],
            timeEnd: timeRange[1],
          },
          { upsert: true },
        );
      }
    }
  }
};

const testTimes = ['06:00 pm', '10:30 AM', '12:00 pm', '05:30 AM'];

const parseStringToDate = (timeString: string) => {
  try {
    const TIME_OFFSET = 8;
    const time = timeString.match(/(\d+):(\d\d)\s*([Pp]?)/);
    if (!time) {
      return undefined;
    }
    const newDate = new Date();
    const parsedHours = parseInt(time[1], 10);
    const isPm = time[3];
    const hours = isPm && parsedHours < 12 ? parsedHours + 12 : parsedHours;
    newDate.setHours(hours - TIME_OFFSET);
    newDate.setMinutes(parseInt(time[2], 10) || 0);
    return newDate;
  } catch (e) {
    console.log('error parsing string to date', timeString);
    return undefined;
  }
};

const parseDateToString = (date?: Date) => {
  try {
    const TIME_OFFSET = 8;
    if (!date) {
      return undefined;
    }
    const adjustedHours = date.getHours() + TIME_OFFSET;
    const isPM = adjustedHours >= 12;
    const hours = adjustedHours > 12 ? adjustedHours - 12 : adjustedHours;
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} ${isPM ? 'PM' : 'AM'}`;
  } catch (e) {
    // console.log('error parsing string to date', timeString);
    return undefined;
  }
};

const validForRange = (start?: Date, end?: Date, time?: Date) =>
  time && start && end && time <= end && time >= start;

interface AlertResults {
  courtId: number;
  date: string;
  slots: TimeSlot[];
}

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
      console.log('pending alert', { courtId, alertDate });
      const courtToNumber = parseInt(courtId, 10);
      timeSlotResults.push({ courtId: courtToNumber, date: alertDate, slots: [] });
    }
  }

  // add time slot data
  await runWithBrowser(async browser => {
    for (const alertToCheck of timeSlotResults) {
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

  console.log(timeSlotResults);

  const start = parseStringToDate('9:30 AM');
  const end = parseStringToDate('5:00 PM');

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

  // for (const result of timeSlotResults) {
  //   console.log('checking', { courtId: result.courtId, date: result.date });
  //   const times = testTimes
  //     .map(slot => parseStringToDate(slot))
  //     .filter(time => time);
  //   console.log('times available', times);
  //   const filteredTimes = (times ?? []).filter(time =>
  //     validForRange(start, end, time),
  //   );
  //   const stringTimes = filteredTimes.map(time => parseDateToString(time));
  //   console.log('string', stringTimes);
  // }
  // filter slots for valid time ranges
  // alert when found
  // update alert status
};

export const runCheck = async () => {
  // await runWithBrowser(async browser => {
  //   const hamilton1Times = await getTimeSlots(browser, {
  //     courtId: 4441573,
  //     date: '11/10/2022',
  //   });
  //   console.log('hamilton test 1', hamilton1Times);

  //   const hamilton1Times2 = await getTimeSlots(browser, {
  //     courtId: 4441573,
  //     date: '11/12/2022',
  //   });
  //   console.log('hamilton test 2', hamilton1Times2);

  //   const hamilton1Times3 = await getTimeSlots(browser, {
  //     courtId: 3333274,
  //     date: '11/10/2022',
  //   });
  //   console.log('hamilton test 3', hamilton1Times3);
  // });
  // await createTestData();
  await runCheckForUser();
};
