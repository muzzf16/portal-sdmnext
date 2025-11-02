export interface DataChangeRequest {
  id?: number;
  employeeId: string;
  requestedChanges: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}