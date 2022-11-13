"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DND_END = exports.DND_START = exports.TIME_OFFSET = exports.COURTS = exports.PAGE_SELECTORS = exports.STATUS_TEXT = void 0;
exports.STATUS_TEXT = {
    UNAVAILABLE: 'Unavailable',
    BOOKED: 'Booked',
    AVAILABLE: 'Available',
};
exports.PAGE_SELECTORS = {
    CONTENT_BOX: '#pt1\\:dcTime\\:dc_g1',
    UNAVAILBLE_TEXT: '#pt1\\:dcTime\\:dc_ot1',
    ALL_TIME_BLOCKS: '#pt1\\:dcTime\\:pgl23 > div',
};
exports.COURTS = {
    HAMILTON_1: 4441573,
    HAMILTON_2: 3333274,
};
exports.TIME_OFFSET = 8;
exports.DND_START = 23; // 11 pm
exports.DND_END = 8; // 8 am
