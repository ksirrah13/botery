import { getTimeSlots, runWithBrowser } from '../utils';

(async () => {
  await runWithBrowser(async browser => {
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
  });
})();
