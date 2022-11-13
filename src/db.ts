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
};
