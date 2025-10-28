export interface Pelatihan {
  id: number;
  employeeId: number;
  trainingName: string;
  organizer: string;
  startDate: string;
  endDate: string;
  certificate?: string;
}
