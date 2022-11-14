// expected format: HH:MM AM/PM - 09:30 PM
export const parseTimeStringToDate = (timeString: string) => {
  try {
    const time = timeString.match(/(\d+):(\d\d)\s*([Pp]?)/);
    if (!time) {
      return undefined;
    }
    const parsedHours = parseInt(time[1], 10);
    const isPm = time[3];
    const hours = isPm && parsedHours < 12 ? parsedHours + 12 : parsedHours;
    const mins = parseInt(time[2], 10) || 0;
    return Date.UTC(0, 0, 0, hours, mins || 0);
  } catch (e) {
    console.log('error parsing string to date', timeString);
    return undefined;
  }
};

// returns format: HH:MM AM/PM - 09:30 PM
export const parseDateToTimeString = (date?: Date) => {
  try {
    if (!date) {
      return undefined;
    }
    const utcHours = date.getUTCHours();
    const isPM = utcHours >= 12;
    const hours = utcHours > 12 ? utcHours - 12 : utcHours;
    const mins = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${mins} ${isPM ? 'PM' : 'AM'}`;
  } catch (e) {
    console.log('error parsing date to string', date);
    return undefined;
  }
};

export const validForRange = (start?: Date, end?: Date, time?: Date) =>
  time && start && end && time <= end && time >= start;
