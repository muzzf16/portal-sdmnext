/**
 * User interface defining the structure of user data
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Alternative user interface (possibly for different use case)
 */
export interface Pengguna {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Employee interface for representing employee data
 */
export interface Pegawai {
  id: number; // Changed to number based on usage
  name: string;
  email: string;
  position: string;
  department: string;
  joinDate: string;
  // Added for contract management
  start_date?: string;   // English field name
  end_date?: string;     // English field name
  tanggal_masuk?: string; // Indonesian field name
  tanggal_keluar?: string; // Indonesian field name
  kontrak_berakhir?: string; // Indonesian field name for contract end
  // Additional possible field names for compatibility
  contractStartDate?: string;
  contractEndDate?: string;
  // Additional fields for charts and analytics
  jenis_kelamin?: string; // Indonesian field name for gender ('L', 'P')
  gender?: string;        // English field name for gender
  pendidikan_terakhir?: string; // Indonesian field name for education
  education?: string;     // English field name for education
}

/**
 * Employment history interface
 */
export interface RiwayatJabatan {
  id: string;
  pegawai_id: number;
  jabatan_lama: string;
  jabatan_baru: string;
  tanggal_perubahan: string;
}

/**
 * Training interface
 */
export interface Pelatihan {
  id: string;
  pegawai_id: number;
  nama_pelatihan: string;
  penyelenggara: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nomor_sertifikat: string;
}

/**
 * Notification interface
 */
export interface Notifikasi {
  id: number;
  employee_id: number;
  type: string;
  title?: string; // Optional title property to avoid breaking changes
  message: string;
  is_read: boolean;
  created_at: string; // Required property
  // For backward compatibility with English property names
  createdAt?: string;
}

/**
 * Onboarding task interface
 */
export interface TugasOrientasi {
  id: number; // Changed to number
  employee_id: number;
  task_name: string;
  description: string;
  due_date: string;
  completed_date: string | null;
  completed: boolean;
}

/**
 * Candidate interface for recruitment module
 */
export interface Kandidat {
  id: number; // Changed to number
  name: string;
  email: string;
  phone: string;
  position_applied: string;
  resume_url: string;
  status: string;
  created_at: string;
}

/**
 * Attendance interface (English property names)
 */
export interface Attendance {
  id: string;
  employee_id: number;
  date: string;
  clock_in: string;
  clock_out: string;
  status: string;
  // For backward compatibility with Indonesian property names
  tanggal: string;
  jam_masuk: string;
  jam_keluar: string;
  status_kehadiran: string;
}

/**
 * Alternative attendance interface with Indonesian property names
 * (Keeping the original Absensi for backward compatibility)
 */
export interface Absensi {
  id: string;
  employee_id: number;
  tanggal: string;
  jam_masuk: string;
  jam_keluar: string;
  status_kehadiran: string;
}

/**
 * Payroll interface
 */
export interface Penggajian {
  id: string;
  employee_id: number;
  period: string;
  base_salary: number;
  total_allowances: number;
  total_deductions: number;
  net_salary: number;
}

/**
 * Contract interface
 */
export interface Kontrak {
  id: string;
  contractNumber: string;
  contractType: string;
  startDate: string;
  endDate: string;
  status: string;
}

/**
 * Performance interface
 */
export interface Kinerja {
  id: string;
  employeeName: string;
  overallScore: number;
  status: string;
}

/**
 * Application interface
 */
export interface Lamaran {
  id: string;
  candidateName: string;
  position: string;
  status: string;
}

// Extended interfaces for employee details
export interface RiwayatJabatan {
  id: number;
  pegawai_id: number;
  jabatan_lama: string;
  jabatan_baru: string;
  tanggal_perubahan: string;
  unit_kerja?: string;
}

export interface Pelatihan {
  id: number;
  pegawai_id: number;
  nama_pelatihan: string;
  penyelenggara: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nomor_sertifikat?: string;
  durasi?: string;
  deskripsi?: string;
}