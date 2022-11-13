import { Schema, model } from 'mongoose';

interface IJobStatus {
  jobId: string;
  status: string;
}

const jobStatusSchema = new Schema<IJobStatus>({
  jobId: { type: String, required: true },
  status: { type: String, required: true },
});

export const JobStatus = model<IJobStatus>('JobStatus', jobStatusSchema);
