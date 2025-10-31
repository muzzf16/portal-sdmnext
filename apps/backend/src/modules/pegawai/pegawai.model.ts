
// src/modules/pegawai/pegawai.model.ts

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

export interface PayrollInfo {
  baseSalary: number;
  incomes: { id: string; name: string; amount: number }[];
  deductions: { id: string; name: string; amount: number }[];
}

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
}
