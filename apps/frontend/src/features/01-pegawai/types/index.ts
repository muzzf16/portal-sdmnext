// Education History type
export interface EducationHistory {
  level?: string;
  schoolName?: string;
  institution?: string; // Alias for schoolName for compatibility
  major?: string;
  graduationYear?: string;
}

export interface Pegawai {
  id: string;
  nip: string;
  name: string;
  email: string;
  position: string;
  pangkat?: string;
  golongan?: string;
  department: string;
  joinDate: string;
  avatarUrl?: string;
  jenis_kelamin?: 'L' | 'P';
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
  educationHistory?: EducationHistory[];
  workHistory?: string; // JSON string
  trainingCertificates?: string; // JSON string
  payrollInfo?: string; // JSON string
  // Hierarchy fields
  jabatan_id?: number;
  atasan_id?: string; // FK to pegawai.id (direct manager)
  atasanNama?: string; // Manager name (joined from query)
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
  tanggal_mulai: string;
  tanggal_selesai: string;
  nomor_sertifikat?: string;
  durasi?: string;
  deskripsi?: string;
}
