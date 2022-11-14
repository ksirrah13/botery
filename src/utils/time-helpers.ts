import { subDays } from 'date-fns';

// expected format: HH:MM AM/PM - 09:30 PM
export const timeToDate = (timeString: string) => {
  const time = timeString.match(/(\d+):(\d\d)\s*([Pp]?)/);
  if (!time) {
    throw new Error('error parsing time string to date');
  }
  const parsedHours = parseInt(time[1], 10);
  const isPm = time[3];
  const hours = isPm && parsedHours < 12 ? parsedHours + 12 : parsedHours;
  const mins = parseInt(time[2], 10) || 0;
  return new Date(Date.UTC(0, 0, 0, hours, mins || 0));
};

// expected format: MM/DD/YYYY - 11/21/2022
export const dayToDate = (dateString: string) => {
  const results = dateString.split('/');
  if (results.length !== 3) {
    throw new Error('error parsing date string to date');
  }
  const [month, day, year] = results.map(val => parseInt(val, 10));
  return new Date(Date.UTC(year, month - 1, day));
};

// returns format: HH:MM AM/PM - 09:30 PM
export const dateToTime = (date: Date) => {
  const utcHours = date.getUTCHours();
  const isPM = utcHours >= 12;
  const hours = utcHours > 12 ? utcHours - 12 : utcHours;
  const mins = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${mins} ${isPM ? 'PM' : 'AM'}`;
};

// returns format: MM/DD/YYYY - 11/21/2022
export const dateToDay = (date: Date) => {
  const month = date.getUTCMonth() + 1; // Jan is 0
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
};

export const validForRange = (start: Date, end: Date, time: Date) =>
  time <= end && time >= start;

const PST_OFFSET = 8;

// time norialized to same date for comparing with other parsed times of day
export const normalizedTime = (date?: Date) => {
  const nowUtc = new Date();
  nowUtc.setUTCHours(nowUtc.getUTCHours() - PST_OFFSET); // since we treat PST as UTC we need to adjust
  const nowTime = date ?? nowUtc; // if no date provdide use the adjusted time for now
  return new Date(Date.UTC(0, 0, 0, nowTime.getUTCHours(), nowTime.getUTCMinutes()));
};

// get todays date in midnight PST
export const normalizedDay = () => {
  const nowUtc = new Date();
  // if its between midnight and 8am that means UTC has moved on to the next day
  // so for PST we need to come back one day
  const adjustedDays =
    nowUtc.getUTCHours() < PST_OFFSET ? subDays(nowUtc, 1) : nowUtc;
  adjustedDays.setUTCHours(0);
  adjustedDays.setUTCMinutes(0);
  adjustedDays.setUTCSeconds(0);
  adjustedDays.setUTCMilliseconds(0);
  return adjustedDays;
};
