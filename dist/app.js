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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("./constants");
const db_1 = require("./db");
const puppeteer_helpers_1 = require("./utils/puppeteer-helpers");
const check_availability_1 = require("./scripts/check-availability");
dotenv_1.default.config();
const { PORT } = process.env;
const app = (0, express_1.default)();
app.get('/', (_req, res) => {
    res.send('Hello world!');
});
app.get('/ham', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { days } = req.query;
    const [start, end] = (days !== null && days !== void 0 ? days : new Date().getDate().toString())
        .split(',')
        .map(val => parseInt(val, 10));
    const numDays = end ? end - start + 1 : 1;
    const dateRange = Array.from(Array(numDays), (_, ix) => start + ix);
    const courts = Object.entries(constants_1.COURTS).filter(([key]) => ['HAMILTON_1', 'HAMILTON_2'].includes(key));
    const availabilityResults = yield (0, puppeteer_helpers_1.runWithBrowser)((browser) => __awaiter(void 0, void 0, void 0, function* () {
        const availabilityResults = {};
        for (const day of dateRange) {
            const date = `11/${day}/2022`;
            const courtResults = {};
            for (const [courtName, courtId] of courts) {
                const timeSlots = yield (0, puppeteer_helpers_1.getTimeSlots)(browser, { courtId, date });
                const availableTimes = timeSlots
                    .filter(({ status }) => status === constants_1.STATUS_TEXT.AVAILABLE)
                    .map(({ time }) => time);
                if (availableTimes.length > 0) {
                    courtResults[courtName] = availableTimes;
                }
            }
            if (Object.keys(courtResults).length > 0) {
                availabilityResults[date] = courtResults;
            }
        }
        return availabilityResults;
    }));
    res.send(availabilityResults);
}));
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.setupDb)();
    yield (0, check_availability_1.runCheck)();
    console.log(`Listening on port ${PORT}...`);
}));
