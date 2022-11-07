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
const utils_1 = require("../utils");
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, utils_1.runWithBrowser)((browser) => __awaiter(void 0, void 0, void 0, function* () {
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
    }));
}))();
