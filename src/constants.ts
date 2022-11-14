import { timeToDate } from './utils/time-helpers';

export const STATUS_TEXT = {
  UNAVAILABLE: 'Unavailable',
  BOOKED: 'Booked',
  AVAILABLE: 'Available',
} as const;

export type SlotStatus = 'Unavailable' | 'Booked' | 'Available';

export const PAGE_SELECTORS = {
  CONTENT_BOX: '#pt1\\:dcTime\\:dc_g1',
  UNAVAILBLE_TEXT: '#pt1\\:dcTime\\:dc_ot1',
  ALL_TIME_BLOCKS: '#pt1\\:dcTime\\:pgl23 > div',
};

export const COURTS = {
  HAMILTON_1: '4441573',
  HAMILTON_2: '3333274',
};

export const TIME_OFFSET = 8;

export const DND_START = timeToDate('11:00 PM');
export const DND_END = timeToDate('8:00 AM');
