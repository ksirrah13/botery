import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request } from 'express';
import { setupDb } from './db';
import { CourtAlerts } from './models/CourtAlerts';

dotenv.config();

const { PORT } = process.env;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Hello world!');
});

app.post('/alert', async (req, res) => {
  if (!req.body) {
    return res.json('missing body');
  }
  const { courtIds, date, startTime, endTime, userId } = req.body;
  const updateOps = createBulkUpdateOps({
    courtIds,
    date,
    startTime,
    endTime,
    userId,
  });
  const result = await CourtAlerts.bulkWrite(updateOps);
  res.send({
    alerts_updated: result.upsertedCount,
  });
});

app.get('/alerts', async (req: Request<{ userId?: string }>, res) => {
  const { userId } = req.query;
  const results = userId
    ? await CourtAlerts.find({ userId }).lean().exec()
    : await CourtAlerts.find().lean().exec();
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

const createBulkUpdateOps = ({
  courtIds,
  date,
  startTime,
  endTime,
  userId,
}: {
  courtIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
}) => {
  if (!courtIds.length) {
    return [];
  }
  return courtIds.map(courtId => ({
    updateOne: {
      filter: { userId, courtId, date: new Date(date) },
      update: {
        $set: {
          userId,
          courtId,
          date: new Date(date),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
      },
      upsert: true,
    },
  }));
};
