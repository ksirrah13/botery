import { Schema, model } from 'mongoose';

interface ICourtAlerts {
  userId: string;
  courtId: string;
  status: string;
  date: Date;
  startTime: Date;
  endTime: Date;
}

const CourtAlertsSchema = new Schema<ICourtAlerts>({
  userId: String,
  courtId: String,
  status: String,
  date: Date,
  startTime: Date,
  endTime: Date,
});

export const CourtAlerts = model<ICourtAlerts>('CourtAlerts', CourtAlertsSchema);
