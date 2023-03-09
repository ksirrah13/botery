import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { COURTS, STATUS_TEXT } from './constants';
import { setupDb } from './db';
import { getTimeSlots, runWithBrowser } from './utils/puppeteer-helpers';
import { dateToDay, dayToDate } from './utils/time-helpers';
import { CourtAlerts } from './models/CourtAlerts';

dotenv.config();

const { PORT } = process.env;

const app = express();
app.use(cors());
app.use(express.json());

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
      const date = dayToDate(`11/${day}/2022`);
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
        availabilityResults[dateToDay(date)] = courtResults;
      }
    }
    return availabilityResults;
  });

  res.send(availabilityResults);
});

app.post('/alert', async (req, res) => {
  if (!req.body) {
    return res.json('missing body');
  }
  const { courtId, date, startTime, endTime } = req.body;
  const result = await CourtAlerts.findOneAndUpdate(
    {
      userId: 'kyle',
      courtId,
      date: new Date(date),
    },
    {
      userId: 'kyle',
      courtId,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
    { upsert: true, new: true },
  )
    .lean()
    .exec();
  res.send(result);
});

app.get('/alerts', async (req, res) => {
  const results = await CourtAlerts.find({
    userId: 'kyle',
  })
    .lean()
    .exec();
  res.json(results);
});

app.delete('/alert', async (req, res) => {
  if (!req.body) {
    return res.json('missing body');
  }
  const { _id } = req.body;
  const results = await CourtAlerts.findByIdAndDelete(_id);
  res.json(results);
});

app.listen(PORT, async () => {
  await setupDb();
  console.log(`Listening on port ${PORT}...`);
});
