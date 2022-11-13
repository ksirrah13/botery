"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validForRange = exports.parseDateToString = exports.parseStringToDate = void 0;
const constants_1 = require("../constants");
const parseStringToDate = (timeString) => {
    try {
        const time = timeString.match(/(\d+):(\d\d)\s*([Pp]?)/);
        if (!time) {
            return undefined;
        }
        const newDate = new Date();
        const parsedHours = parseInt(time[1], 10);
        const isPm = time[3];
        const hours = isPm && parsedHours < 12 ? parsedHours + 12 : parsedHours;
        newDate.setHours(hours - constants_1.TIME_OFFSET);
        newDate.setMinutes(parseInt(time[2], 10) || 0);
        return newDate;
    }
    catch (e) {
        console.log('error parsing string to date', timeString);
        return undefined;
    }
};
exports.parseStringToDate = parseStringToDate;
const parseDateToString = (date) => {
    try {
        if (!date) {
            return undefined;
        }
        const adjustedHours = date.getHours() + constants_1.TIME_OFFSET;
        const isPM = adjustedHours >= 12;
        const hours = adjustedHours > 12 ? adjustedHours - 12 : adjustedHours;
        const mins = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${mins} ${isPM ? 'PM' : 'AM'}`;
    }
    catch (e) {
        console.log('error parsing date to string', date);
        return undefined;
    }
};
exports.parseDateToString = parseDateToString;
const validForRange = (start, end, time) => time && start && end && time <= end && time >= start;
exports.validForRange = validForRange;
