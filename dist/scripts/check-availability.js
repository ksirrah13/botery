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
const dotenv_1 = __importDefault(require("dotenv"));
const puppeteer_1 = require("puppeteer");
const utils_1 = require("../utils");
dotenv_1.default.config();
const DEBUG = process.env.DEBUG === 'true';
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield (0, puppeteer_1.launch)(Object.assign(Object.assign({ headless: !DEBUG }, (DEBUG ? { slowMo: 500 } : {})), { args: ['--no-sandbox'] }));
    const hamilton1Times = yield (0, utils_1.getTimeSlots)(browser, {
        courtId: 4441573,
        date: '11/10/2022',
    });
    console.log('hamilton test 1', hamilton1Times);
    const hamilton1Times2 = yield (0, utils_1.getTimeSlots)(browser, {
        courtId: 4441573,
        date: '11/12/2022',
    });
    console.log('hamilton test 2', hamilton1Times2);
    const hamilton1Times3 = yield (0, utils_1.getTimeSlots)(browser, {
        courtId: 3333274,
        date: '11/10/2022',
    });
    console.log('hamilton test 3', hamilton1Times3);
    if (!DEBUG) {
        yield browser.close();
    }
}))();
