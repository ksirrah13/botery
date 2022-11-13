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
exports.sendAlert = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const puppeteer_helpers_1 = require("./puppeteer-helpers");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASSWORD, // generated app password
    },
});
const sendAlert = (recipientEmailList, courtId, date, times) => __awaiter(void 0, void 0, void 0, function* () {
    // create reusable transporter object using the default SMTP transport
    const tennisUrlPage = (0, puppeteer_helpers_1.getTennisCourtUrl)(courtId, date);
    // send mail with defined transport object
    yield transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: recipientEmailList,
        subject: 'Botery Alert!',
        text: `Found Available Court Openings! ${times} ${tennisUrlPage}`, // plain text body
    });
    console.log('Message sent!');
});
exports.sendAlert = sendAlert;
