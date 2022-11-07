import dotenv from 'dotenv';
import { launch } from 'puppeteer';
import { getTimeSlots } from '../utils';

dotenv.config();

(async () => {
  const browser = await launch({
    headless: false,
    // slowMo: 500,
    args: ['--no-sandbox'],
  });

  const hamilton1Times = await getTimeSlots(browser, {
    courtId: 4441573,
    date: '11/10/2022',
  });
  console.log('hamilton test 1', hamilton1Times);

  const hamilton1Times2 = await getTimeSlots(browser, {
    courtId: 4441573,
    date: '11/12/2022',
  });
  console.log('hamilton test 2', hamilton1Times2);

  const hamilton1Times3 = await getTimeSlots(browser, {
    courtId: 3333274,
    date: '11/10/2022',
  });
  console.log('hamilton test 3', hamilton1Times3);

  // setTimeout(() => browser.close(), 3000);
})();
