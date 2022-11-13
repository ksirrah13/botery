import puppeteerOrig, { Browser, Page, executablePath } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import { PAGE_SELECTORS, SlotStatus, STATUS_TEXT } from '../constants';
import { TimeSlot } from '../types';

puppeteerExtra.use(StealthPlugin());

dotenv.config();
const GO_HEADFUL = process.env.GO_HEADFUL === 'true';
const USE_STEALTH = process.env.USE_STEALTH === 'true';

const puppeteer = USE_STEALTH ? puppeteerExtra : puppeteerOrig;

export const getTennisCourtUrl = (courtId: number, date: string) => {
  const encodedDate = encodeURIComponent(date);
  return `https://www.spotery.com/f/adf.task-flow?adf.tfDoc=%2FWEB-INF%2Ftaskflows%2Ffacility%2Ftf-faci-detail.xml&psOrgaSk=${courtId}&psReservationDateStr=${encodedDate}&adf.tfId=tf-faci-detail`;
};

const getNewPage = async (browser: Browser, url: string) => {
  try {
    const page = await browser.newPage();
    if (!USE_STEALTH) {
      // stealth will update this for us already
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
      );
    }
    await page.goto(url);
    return page;
  } catch (e) {
    console.log('error getting new page for url', { url });
  }
};

interface TimeSlotSearchParams {
  courtId: number;
  date: string;
}

interface Options {
  filterByStatus?: SlotStatus;
}

const getTimeSlotsFromPage = async (page?: Page): Promise<TimeSlot[]> => {
  if (!page) {
    console.log('empty page for time slots');
    return [{ time: STATUS_TEXT.UNAVAILABLE, status: 'Error getting page' }];
  }
  await page.waitForSelector(PAGE_SELECTORS.CONTENT_BOX);
  const results = await page.evaluate(
    ({ STATUS_TEXT, PAGE_SELECTORS }) => {
      const unavailableForBooking = document.querySelector(
        PAGE_SELECTORS.UNAVAILBLE_TEXT,
      );
      if (unavailableForBooking) {
        return [
          {
            time: STATUS_TEXT.UNAVAILABLE,
            status: unavailableForBooking.innerHTML.trim(),
          },
        ];
      }
      const allTimes = document.querySelectorAll(PAGE_SELECTORS.ALL_TIME_BLOCKS);
      const getTimeAndAvailability = (timeBox: Element) => {
        const [timeSpan, statusSpan] = timeBox.querySelectorAll('div span');
        return {
          time: timeSpan.innerHTML.trim(),
          // when empty/available this status will have "&nbsp;" for the text
          status:
            statusSpan.innerHTML.trim() === STATUS_TEXT.BOOKED
              ? STATUS_TEXT.BOOKED
              : STATUS_TEXT.AVAILABLE,
        };
      };
      const timesAndAvailability = Array.from(allTimes).map(getTimeAndAvailability);
      return timesAndAvailability;
    },
    { STATUS_TEXT, PAGE_SELECTORS },
  );
  return results;
};

export const getTimeSlots = async (
  browser: Browser,
  { courtId, date }: TimeSlotSearchParams,
  options?: Options,
): Promise<TimeSlot[]> => {
  try {
    const courtUrl = getTennisCourtUrl(courtId, date);
    const courtPage = await getNewPage(browser, courtUrl);
    const result = await getTimeSlotsFromPage(courtPage);

    if (!GO_HEADFUL) {
      await courtPage?.close();
    }
    if (options?.filterByStatus) {
      return result.filter(({ status }) => status === options.filterByStatus);
    }
    return result;
  } catch (e) {
    console.log('error getting timeslots', { courtId, date });
    console.error(e);
    return [
      { time: STATUS_TEXT.UNAVAILABLE, status: 'Error getting timeslots from page' },
    ];
  }
};

export const runWithBrowser = async <T>(
  opWithBrowser: (browser: Browser) => Promise<T>,
) => {
  const browser = await puppeteer.launch({
    headless: !GO_HEADFUL,
    ...(GO_HEADFUL ? { slowMo: 200 } : {}),
    args: ['--no-sandbox'],
    executablePath: executablePath(),
  });
  const result = await opWithBrowser(browser);
  if (!GO_HEADFUL) {
    await browser.close();
  }
  return result;
};
