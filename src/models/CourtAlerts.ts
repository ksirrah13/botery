import { Schema, model } from 'mongoose';

interface ICourtAlerts {
  userId: string;
  courtId: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: string;
}

const CourtAlertsSchema = new Schema<ICourtAlerts>({
  userId: String,
  courtId: String,
  date: String,
  timeStart: String,
  timeEnd: String,
  status: String,
});

export const CourtAlerts = model<ICourtAlerts>('CourtAlerts', CourtAlertsSchema);
