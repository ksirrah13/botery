"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.runWithBrowser = exports.getTimeSlots = exports.getTennisCourtUrl = void 0;
const puppeteer_1 = __importStar(require("puppeteer"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("../constants");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
dotenv_1.default.config();
const GO_HEADFUL = process.env.GO_HEADFUL === 'true';
const USE_STEALTH = process.env.USE_STEALTH === 'true';
const puppeteer = USE_STEALTH ? puppeteer_extra_1.default : puppeteer_1.default;
const getTennisCourtUrl = (courtId, date) => {
    const encodedDate = encodeURIComponent(date);
    return `https://www.spotery.com/f/adf.task-flow?adf.tfDoc=%2FWEB-INF%2Ftaskflows%2Ffacility%2Ftf-faci-detail.xml&psOrgaSk=${courtId}&psReservationDateStr=${encodedDate}&adf.tfId=tf-faci-detail`;
};
exports.getTennisCourtUrl = getTennisCourtUrl;
const getNewPage = (browser, url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = yield browser.newPage();
        if (!USE_STEALTH) {
            // stealth will update this for us already
            yield page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36');
        }
        yield page.goto(url);
        return page;
    }
    catch (e) {
        console.log('error getting new page for url', { url });
    }
});
const getTimeSlotsFromPage = (page) => __awaiter(void 0, void 0, void 0, function* () {
    if (!page) {
        console.log('empty page for time slots');
        return [{ time: constants_1.STATUS_TEXT.UNAVAILABLE, status: 'Error getting page' }];
    }
    yield page.waitForSelector(constants_1.PAGE_SELECTORS.CONTENT_BOX);
    const results = yield page.evaluate(({ STATUS_TEXT, PAGE_SELECTORS }) => {
        const unavailableForBooking = document.querySelector(PAGE_SELECTORS.UNAVAILBLE_TEXT);
        if (unavailableForBooking) {
            return [
                {
                    time: STATUS_TEXT.UNAVAILABLE,
                    status: unavailableForBooking.innerHTML.trim(),
                },
            ];
        }
        const allTimes = document.querySelectorAll(PAGE_SELECTORS.ALL_TIME_BLOCKS);
        const getTimeAndAvailability = (timeBox) => {
            const [timeSpan, statusSpan] = timeBox.querySelectorAll('div span');
            return {
                time: timeSpan.innerHTML.trim(),
                // when empty/available this status will have "&nbsp;" for the text
                status: statusSpan.innerHTML.trim() === STATUS_TEXT.BOOKED
                    ? STATUS_TEXT.BOOKED
                    : STATUS_TEXT.AVAILABLE,
            };
        };
        const timesAndAvailability = Array.from(allTimes).map(getTimeAndAvailability);
        return timesAndAvailability;
    }, { STATUS_TEXT: constants_1.STATUS_TEXT, PAGE_SELECTORS: constants_1.PAGE_SELECTORS });
    return results;
});
const getTimeSlots = (browser, { courtId, date }, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courtUrl = (0, exports.getTennisCourtUrl)(courtId, date);
        const courtPage = yield getNewPage(browser, courtUrl);
        const result = yield getTimeSlotsFromPage(courtPage);
        if (!GO_HEADFUL) {
            yield (courtPage === null || courtPage === void 0 ? void 0 : courtPage.close());
        }
        if (options === null || options === void 0 ? void 0 : options.filterByStatus) {
            return result.filter(({ status }) => status === options.filterByStatus);
        }
        return result;
    }
    catch (e) {
        console.log('error getting timeslots', { courtId, date });
        console.error(e);
        return [
            { time: constants_1.STATUS_TEXT.UNAVAILABLE, status: 'Error getting timeslots from page' },
        ];
    }
});
exports.getTimeSlots = getTimeSlots;
const runWithBrowser = (opWithBrowser) => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer.launch(Object.assign(Object.assign({ headless: !GO_HEADFUL }, (GO_HEADFUL ? { slowMo: 200 } : {})), { args: ['--no-sandbox'], executablePath: (0, puppeteer_1.executablePath)() }));
    const result = yield opWithBrowser(browser);
    if (!GO_HEADFUL) {
        yield browser.close();
    }
    return result;
});
exports.runWithBrowser = runWithBrowser;
