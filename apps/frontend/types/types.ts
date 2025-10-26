export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
}

export interface RiwayatJabatan {
  id: number;
  pegawai_id: number;
  jabatan_lama: string;
  jabatan_baru: string;
  tanggal_perubahan: string;
}

export interface Pelatihan {
  id: number;
  pegawai_id: number;
  nama_pelatihan: string;
  penyelenggara: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nomor_sertifikat: string;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position_applied: string;
  status: string;
  resume_url: string;
  created_at: string;
}

export interface OnboardingTask {
  id: number;
  employee_id: number;
  task_name: string;
  description: string;
  due_date: string;
  completed: boolean;
  completed_date: string;
}

export interface Attendance {
  employee_id: number;
  date: string;
  clock_in: string;
  clock_out: string;
}

export interface Payroll {
  employee_id: number;
  period: string;
  base_salary: number;
  total_allowances: number;
  total_deductions: number;
  net_salary: number;
}

export interface Notification {
  id: number;
  employee_id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
