
// src/modules/pegawai/pegawai.model.ts

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
  educationHistory: any[];
  workHistory: any[];
  trainingCertificates: any[];
  payrollInfo: {
    baseSalary: number;
    incomes: any[];
    deductions: any[];
  };
}
