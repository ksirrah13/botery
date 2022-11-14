import { Schema, model } from 'mongoose';

interface ICourtAlerts {
  userId: string;
  courtId: string;
  dateString: string;
  timeStart: string;
  timeEnd: string;
  status: string;
  date: Date;
  startTime: Date;
  endTime: Date;
}

const CourtAlertsSchema = new Schema<ICourtAlerts>({
  userId: String,
  courtId: String,
  dateString: String,
  timeStart: String,
  timeEnd: String,
  status: String,
  date: Date,
  startTime: Date,
  endTime: Date,
});

export const CourtAlerts = model<ICourtAlerts>('CourtAlerts', CourtAlertsSchema);
