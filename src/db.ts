import mongoose, { connect } from 'mongoose';

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

export const runWithDbConnection = async (ops: () => Promise<void>) => {
  try {
    await setupDb();
    await ops();
  } finally {
    console.log('closing mongodb connection');
    await mongoose.connection.close();
  }
};
