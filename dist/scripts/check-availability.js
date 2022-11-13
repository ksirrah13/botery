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
const CourtAlerts_1 = require("../models/CourtAlerts");
const puppeteer_helpers_1 = require("../utils/puppeteer-helpers");
const time_helpers_1 = require("../utils/time-helpers");
const constants_1 = require("../constants");
const notifications_1 = require("../utils/notifications");
const db_1 = require("../db");
const runCheckForAlerts = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const courtAlerts = yield CourtAlerts_1.CourtAlerts.find({
        userId: 'kyle',
        status: 'new',
    }).exec();
    const alertsByCourt = (0, lodash_1.groupBy)(courtAlerts, 'courtId');
    const datesByCourtId = (0, lodash_1.mapValues)(alertsByCourt, alerts => alerts.map(alert => alert.date));
    const resultsByCourtAndDate = yield (0, puppeteer_helpers_1.runWithBrowser)((browser) => __awaiter(void 0, void 0, void 0, function* () {
        const courtAndDateResults = {};
        for (const courtIdString of Object.keys(datesByCourtId)) {
            const courtId = parseInt(courtIdString, 10);
            const alertDates = datesByCourtId[courtId];
            const dateResults = {};
            for (const date of alertDates) {
                console.log('checking for availability', { date, courtId });
                const result = yield (0, puppeteer_helpers_1.getTimeSlots)(browser, {
                    courtId,
                    date,
                }, { filterByStatus: 'Available' });
                dateResults[date] = result;
                console.log('results', { date, courtId, result });
            }
            courtAndDateResults[courtIdString] = dateResults;
        }
        return courtAndDateResults;
    }));
    for (const alert of courtAlerts) {
        const start = (0, time_helpers_1.parseStringToDate)(alert.timeStart);
        const end = (0, time_helpers_1.parseStringToDate)(alert.timeEnd);
        const timeSlots = (_a = resultsByCourtAndDate[alert.courtId]) === null || _a === void 0 ? void 0 : _a[alert.date];
        const filteredTimes = timeSlots
            .map(slot => (0, time_helpers_1.parseStringToDate)(slot.time))
            .filter(time => (0, time_helpers_1.validForRange)(start, end, time));
        if (filteredTimes.length > 0) {
            const stringTimes = filteredTimes.map(time => { var _a; return (_a = (0, time_helpers_1.parseDateToString)(time)) !== null && _a !== void 0 ? _a : ''; });
            console.log('Found available times! Sending alert!', {
                userId: alert.userId,
                courtId: alert.courtId,
                date: alert.date,
                start: alert.timeStart,
                end: alert.timeEnd,
                foundTimes: stringTimes,
            });
            // TODO add users and alert recipients to db
            yield (0, notifications_1.sendAlert)([(_b = process.env.TEST_RECIPIENTS) !== null && _b !== void 0 ? _b : ''], parseInt(alert.courtId, 10), alert.date, stringTimes);
            yield alert.updateOne({ status: 'alerted' });
        }
    }
});
const runCheck = () => __awaiter(void 0, void 0, void 0, function* () {
    // await createTestData();
    if (process.env.ENABLE_DND === 'true') {
        // don't run or alert at night
        const currentHours = new Date().getHours();
        if (currentHours >= constants_1.DND_START || currentHours < constants_1.DND_END) {
            console.log('skipping check during DND time', {
                currentHours,
                DND_START: constants_1.DND_START,
                DND_END: constants_1.DND_END,
            });
            return;
        }
    }
    yield runCheckForAlerts();
});
exports.runCheck = runCheck;
(0, db_1.runWithDbConnection)(() => (0, exports.runCheck)());
