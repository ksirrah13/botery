import { Browser, Page } from 'puppeteer';
import { PAGE_SELECTORS, STATUS_TEXT } from './constants';
import { TimeSlot } from './types';

const DEBUG = process.env.DEBUG === 'true';

const getTennisCourtUrl = (courtId: number, date: string) => {
  const encodedDate = encodeURIComponent(date);
  return `https://www.spotery.com/f/adf.task-flow?adf.tfDoc=%2FWEB-INF%2Ftaskflows%2Ffacility%2Ftf-faci-detail.xml&psOrgaSk=${courtId}&psReservationDateStr=${encodedDate}&adf.tfId=tf-faci-detail`;
};

const getNewPage = async (browser: Browser, url: string) => {
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
    );
    await page.goto(url);
    return page;
  } catch (e) {
    console.log('error getting new page for url', { url });
  }
};

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
  {
    courtId,
    date,
  }: {
    courtId: number;
    date: string;
  },
): Promise<TimeSlot[]> => {
  const courtUrl = getTennisCourtUrl(courtId, date);
  const courtPage = await getNewPage(browser, courtUrl);
  const result = await getTimeSlotsFromPage(courtPage);
  if (!DEBUG) {
    await courtPage?.close();
  }
  return result;
};
