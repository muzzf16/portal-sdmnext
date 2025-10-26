// src/modules/orientasi/tugasOrientasi.model.ts

export interface TugasOrientasi {
  id: string;
  employee_id: string;
  task_name: string;
  description: string;
  due_date: string;
  completed: boolean;
}