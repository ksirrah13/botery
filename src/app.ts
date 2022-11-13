import express from 'express';
import dotenv from 'dotenv';
import { COURTS, STATUS_TEXT } from './constants';
import { setupDb } from './db';
import { getTimeSlots, runWithBrowser } from './utils';

dotenv.config();

const { PORT } = process.env;

const app = express();

app.get('/', (_req, res) => {
  res.send('Hello world!');
});

app.get('/ham', async (req, res) => {
  const { days }: { days?: string } = req.query;
  const [start, end] = (days ?? new Date().getDate().toString())
    .split(',')
    .map(val => parseInt(val, 10));
  const numDays = end ? end - start + 1 : 1;
  const dateRange: number[] = Array.from(Array(numDays), (_, ix) => start + ix);
  const courts = Object.entries(COURTS).filter(([key]) =>
    ['HAMILTON_1', 'HAMILTON_2'].includes(key),
  );
  const availabilityResults = await runWithBrowser(async browser => {
    const availabilityResults: Record<string, Record<string, string[]>> = {};
    for (const day of dateRange) {
      const date = `11/${day}/2022`;
      const courtResults: Record<string, string[]> = {};
      for (const [courtName, courtId] of courts) {
        const timeSlots = await getTimeSlots(browser, { courtId, date });
        const availableTimes = timeSlots
          .filter(({ status }) => status === STATUS_TEXT.AVAILABLE)
          .map(({ time }) => time);
        if (availableTimes.length > 0) {
          courtResults[courtName] = availableTimes;
        }
      }
      if (Object.keys(courtResults).length > 0) {
        availabilityResults[date] = courtResults;
      }
    }
    return availabilityResults;
  });

  res.send(availabilityResults);
});

app.listen(PORT, async () => {
  await setupDb();
  console.log(`Listening on port ${PORT}...`);
});
