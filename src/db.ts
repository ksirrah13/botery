import { connect } from 'mongoose';
import { JobStatus } from './models/JobStatus';

export const setupDb = async () => {
  try {
    if (!process.env.DB_URI) {
      throw new Error('missing DB_URI');
    }
    await connect(process.env.DB_URI);
    console.log('connected to mongodb');
  } catch (e) {
    console.log('error connecting to mongodb');
    throw e;
  }

  await JobStatus.create({ jobId: 'kyle', status: 'running' });
  await JobStatus.create({ jobId: 'another', status: 'ran' });

  const jobs = await JobStatus.find().lean();
  for (const job of jobs) {
    console.log('job', job.jobId, job.status, job._id);
  }
};
