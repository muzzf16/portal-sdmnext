// Education History type
export interface EducationHistory {
  level?: string;
  schoolName?: string;
  major?: string;
  graduationYear?: string;
}

export interface Pegawai {
  id: number;
  nip: string;
  name: string;
  email: string;
  position: string;
  pangkat?: string;
  golongan?: string;
  department: string;
  joinDate: string;
  avatarUrl?: string;
  jenis_kelamin?: 'L' | 'P'; // L for Laki-laki (male), P for Perempuan (female)
  gender?: 'male' | 'female'; // English equivalent
  leaveBalance?: number;
  isActive?: boolean;
  address?: string;
  phone?: string;
  pob?: string; // Place of birth
  dob?: string; // Date of birth
  religion?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  educationHistory?: string | EducationHistory[]; // JSON string or array of objects
  workHistory?: string; // JSON string
  trainingCertificates?: string; // JSON string
  payrollInfo?: string; // JSON string
}

// Riwayat Jabatan (Job History)
export interface RiwayatJabatan {
  id: number;
  pegawai_id: number;
  jabatan_lama: string;
  jabatan_baru: string;
  tanggal_perubahan: string; // ISO date string
  unit_kerja?: string;
}

// Pelatihan (Training)
export interface Pelatihan {
  id: number;
  pegawai_id: number;
  employeeId?: number;
  nama_pelatihan: string;
  penyelenggara: string;
  tanggal_mulai: string; // ISO date string
  tanggal_selesai: string; // ISO date string
  nomor_sertifikat?: string;
  durasi?: string;
  deskripsi?: string;
  // Optional English properties for compatibility
  trainingName?: string;
  organizer?: string;
  startDate?: string;
  endDate?: string;
  certificate?: string;
}
