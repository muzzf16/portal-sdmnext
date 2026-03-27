export type TaskStatus = 'pending' | 'completed' | 'cancelled' | 'approved';

export interface TaskItem {
  id: string;
  supervisor_id: string;
  employee_id: string;
  task_name: string;
  description?: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  employee_name?: string;
  employee_position?: string;
  supervisor_name?: string;
  supervisor_position?: string;
}

export interface CreateTaskPayload {
  id?: string;
  supervisor_id: string;
  employee_id: string;
  task_name: string;
  description?: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}
