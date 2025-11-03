export interface EducationHistory {
  id?: string;
  level: string;
  institution: string;
  major: string;
  graduationYear: number;
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
  workHistory?: string;
  trainingCertificates?: string;
  payrollInfo?: string;
  email: string;
  statusKaryawan?: string;
  tanggalKeluar?: string;
  createdAt?: string;
}
