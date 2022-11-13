export const parseStringToDate = (timeString: string) => {
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

export const parseDateToString = (date?: Date) => {
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
    console.log('error parsing date to string', date);
    return undefined;
  }
};

export const validForRange = (start?: Date, end?: Date, time?: Date) =>
  time && start && end && time <= end && time >= start;
