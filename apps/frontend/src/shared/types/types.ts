/**
 * User interface defining the structure of user data
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  employeeId?: string; // Reference to the employee ID in the pegawai table
  avatarUrl?: string;
  employeeDetails?: Pegawai; // Add this line
}

/**
 * Alternative user interface (possibly for different use case)
 */
export interface Pengguna {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export interface Education {
  level: string;
  institution: string;
  major: string;
  graduationYear: number;
}

export interface WorkHistory {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
}

export interface TrainingCertificate {
  name: string;
  issuer: string;
  issueDate: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  amount: number;
}

export interface PayrollInfo {
  baseSalary: number;
  incomes: SalaryComponent[];
  deductions: SalaryComponent[];
}

/**
 * Employee interface for representing employee data
 */
export interface Pegawai {
  id: string;
  nip: string;
  name: string;
  email: string;
  position: string;
  pangkat: string;
  golongan: string;
  department: string;
  joinDate: string;
  avatarUrl: string;
  jenis_kelamin: string; // Gender: 'L' for Laki-laki, 'P' for Perempuan
  leaveBalance: number;
  isActive: number;
  address: string;
  phone: string;
  pob: string;
  dob: string;
  religion: string;
  maritalStatus: string;
  numberOfChildren: number;
  educationHistory: Education[];
  workHistory: WorkHistory[];
  trainingCertificates: TrainingCertificate[];
  payrollInfo: PayrollInfo;
  tanggalKeluar?: string;
}

export interface AssignedTask {
  id: string;
  supervisor_id: string;
  employee_id: string;
  task_name: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'approved';
  created_at: string;
  updated_at: string;
  employee_name?: string;
  employee_position?: string;
  supervisor_name?: string;
  supervisor_position?: string;
}

/**
 * Employment history interface
 */
export interface RiwayatJabatan {
  id: number;
  pegawai_id: string;
  jabatan_lama: string;
  jabatan_baru: string;
  tanggal_perubahan: string;
  unit_kerja?: string;
}

/**
 * Training interface
 */
export interface Pelatihan {
  id: number;
  pegawai_id: string;
  nama_pelatihan: string;
  penyelenggara: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nomor_sertifikat?: string;
  durasi?: string;
  deskripsi?: string;
}

/**
 * Notification interface
 */
export interface Notifikasi {
  id: number;
  employee_id: string;
  message: string;
  type: string; // e.g., 'info', 'warning', 'error', 'success'
  is_read: boolean;
  created_at: string;
  scheduled_for?: string; // For scheduled notifications
  delivery_channel: string; // e.g., 'in_app', 'email', 'sms'
  related_entity?: string; // e.g., 'contract', 'leave', 'payroll', 'performance'
  related_entity_id?: string; // ID of the related entity
}

/**
 * Leave Request interface
 */
export interface Cuti {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  jumlahHari?: number; // Calculated in backend, optional for frontend
  reason: string;
  status: string; // e.g., 'pending', 'approved', 'rejected'
  supportingDocument?: string;
  rejectionReason?: string;
  createdAt: string;
}

/**
 * Onboarding task interface
 */
export interface TugasOrientasi {
  id: number;
  employee_id: string;
  task_name: string;
  description: string;
  due_date: string;
  completed: boolean;
}

/**
 * Candidate interface for recruitment module
 */
export interface Kandidat {
  id: string;
  name: string;
  email: string;
  phone: string;
  position_applied: string;
  resume_url: string;
  status: string;
  created_at: string;
}

/**
 * Absensi interface
 */
export interface Absensi {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm:ss
  clockOut: string | null; // HH:mm:ss
  status: string;
  workDuration: string | null; // e.g., "8j 15m"
  notes?: string;
}

/**
 * Payroll interface
 */
export interface Penggajian {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g., "Juni 2024"
  baseSalary: number;
  incomes: SalaryComponent[];
  deductions: SalaryComponent[];
  totalIncome: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Draft' | 'Final' | 'Paid';
  totalAttendance?: number;
  totalOvertime?: number;
  totalLateness?: number;
}

/**
 * Contract interface
 */
export interface Kontrak {
  id: string;
  employeeId: string;
  contractNumber: string;
  contractType: string; // e.g., 'permanent', 'temporary', 'contract'
  startDate: string;
  endDate: string;
  status: string; // e.g., 'active', 'expiring', 'expired', 'terminated'
  contractFile?: string;
  terms: string;
  salary: number;
  notes?: string;
}

export interface Kpi {
  id: string;
  metric: string;
  target: string;
  result: string;
  weight: number;
  score: number;
  notes: string;
}

/**
 * Performance interface
 */
export interface PenilaianKinerja {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g., "Q3 2024"
  reviewerName: string; // e.g., "Admin SDM"
  reviewDate: string;
  overallScore: number;
  status: string;
  strengths: string;
  areasForImprovement: string;
  employeeFeedback: string;
  kpis: Kpi[];
}

/**
 * Application interface (assuming this is for recruitment applications)
 */
export interface Lamaran {
  id: string;
  candidateName: string;
  position: string;
  status: string;
}



export interface DataChangeRequest {
  id: number;
  employeeId: string;
  requestedChanges: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}