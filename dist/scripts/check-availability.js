"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCheck = void 0;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const CourtAlerts_1 = require("../models/CourtAlerts");
const utils_1 = require("../utils");
const courtIds = [constants_1.COURTS.HAMILTON_1, constants_1.COURTS.HAMILTON_2];
const dates = ['11/13/2022', '11/14/2022'];
const timeRange = ['5:00 PM', '9:30 PM'];
const users = ['kyle'];
const createTestData = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const court of courtIds) {
        for (const date of dates) {
            for (const user of users) {
                yield CourtAlerts_1.CourtAlerts.findOneAndUpdate({ userId: user, courtId: court, date, status: 'new' }, {
                    userId: user,
                    courtId: court,
                    date,
                    status: 'new',
                    timeStart: timeRange[0],
                    timeEnd: timeRange[1],
                }, { upsert: true });
            }
        }
    }
});
const testTimes = ['06:00 pm', '10:30 AM', '12:00 pm', '05:30 AM'];
const parseStringToDate = (timeString) => {
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
    }
    catch (e) {
        console.log('error parsing string to date', timeString);
        return undefined;
    }
};
const parseDateToString = (date) => {
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
    }
    catch (e) {
        // console.log('error parsing string to date', timeString);
        return undefined;
    }
};
const validForRange = (start, end, time) => time && start && end && time <= end && time >= start;
const runCheckForUser = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // get configured checks for user
    const courtAlerts = yield CourtAlerts_1.CourtAlerts.find({
        userId: 'kyle',
        status: 'new',
    })
        .select('courtId date timeStart timeEnd')
        .lean()
        .exec();
    // check if we've already alerted and should keep checking
    // only alert once for each court and date
    // get time slots for courts and dates
    const alertsByCourt = (0, lodash_1.groupBy)(courtAlerts, 'courtId');
    const timeSlotResults = [];
    for (const courtId of Object.keys(alertsByCourt)) {
        const alertsPerCourt = alertsByCourt[courtId];
        const alertsByDate = (0, lodash_1.groupBy)(alertsPerCourt, 'date');
        for (const alertDate of Object.keys(alertsByDate)) {
            console.log('pending alert', { courtId, alertDate });
            const courtToNumber = parseInt(courtId, 10);
            timeSlotResults.push({ courtId: courtToNumber, date: alertDate, slots: [] });
        }
    }
    // add time slot data
    yield (0, utils_1.runWithBrowser)((browser) => __awaiter(void 0, void 0, void 0, function* () {
        for (const alertToCheck of timeSlotResults) {
            const result = yield (0, utils_1.getTimeSlots)(browser, {
                courtId: alertToCheck.courtId,
                date: alertToCheck.date,
            }, { filterByStatus: 'Available' });
            alertToCheck.slots = result;
        }
    }));
    console.log(timeSlotResults);
    const start = parseStringToDate('9:30 AM');
    const end = parseStringToDate('5:00 PM');
    const resultsGroupedByCourt = (0, lodash_1.groupBy)(timeSlotResults, 'courtId');
    const resultsByCourtAndDate = (0, lodash_1.mapValues)(resultsGroupedByCourt, resultsForCourt => (0, lodash_1.keyBy)(resultsForCourt, 'date'));
    for (const alert of courtAlerts) {
        console.log('testing', { alert });
        const start = parseStringToDate(alert.timeStart);
        const end = parseStringToDate(alert.timeEnd);
        const timeSlots = (_a = resultsByCourtAndDate[alert.courtId]) === null || _a === void 0 ? void 0 : _a[alert.date];
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
});
const runCheck = () => __awaiter(void 0, void 0, void 0, function* () {
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
    yield runCheckForUser();
});
exports.runCheck = runCheck;
