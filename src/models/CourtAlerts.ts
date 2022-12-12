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

/*
Example starter doc

{
  "_id": {
    "$oid": "6396a7aeb17ab9a6170cd82a"
  },
  "userId": "kyle",
  "courtId": "4441573",
  "status": "new",
  "date": {
    "$date": {
      "$numberLong": "1670803200000"
    }
  },
  "startTime": {
    "$date": {
      "$numberLong": "1670864400000"
    }
  },
  "endTime": {
    "$date": {
      "$numberLong": "1670878800000"
    }
  }
}

*/
