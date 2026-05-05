export interface ActivityLibraryItem {
  id: string;
  position: string;
  department: string;
  activityName: string;
  durationMinutes: number;
  outputUnit: string;
  category: string;
  default_nominal?: number;
  created_at?: string;
}

export interface ActivityLibraryFilters {
  position?: string;
  department?: string;
  category?: string;
}

export interface CreateActivityLibraryPayload {
  id?: string;
  position: string;
  department?: string;
  activityName: string;
  durationMinutes: number;
  outputUnit?: string;
  category?: string;
  default_nominal?: number;
}

export interface UpdateActivityLibraryPayload extends Partial<CreateActivityLibraryPayload> {}
