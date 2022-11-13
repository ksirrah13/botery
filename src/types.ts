export interface TimeSlot {
  time: string;
  status: string;
}

export interface AlertResults {
  courtId: number;
  date: string;
  slots: TimeSlot[];
}
