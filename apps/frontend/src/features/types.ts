export interface EducationHistory {
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

export interface PayrollInfo {
  baseSalary: number;
  incomes: { id: string; name: string; amount: number }[];
  deductions: { id: string; name: string; amount: number }[];
}

export interface Pegawai {
  id: string;
  name: string;
  nip: string;
  position: string;
  pangkat?: string;
  golongan?: string;
  department: string;
  joinDate: string;
  avatarUrl?: string;
  jenis_kelamin: 'L' | 'P';
  leaveBalance?: number;
  isActive?: number;
  address?: string;
  phone?: string;
  pob?: string;
  dob?: string;
  religion?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  educationHistory: EducationHistory[];
  workHistory: WorkHistory[];
  trainingCertificates: TrainingCertificate[];
  payrollInfo: PayrollInfo;
  email: string;
  statusKaryawan?: string;
  tanggalKeluar?: string;
  createdAt?: string;
}
