// src/features/01-pegawai/mocks/mockData.ts
// Mock data for testing the employee module

export const mockPegawai = [
  {
    id: '1',
    nip: '123456789',
    name: 'Budi Santoso',
    email: 'budi.santoso@company.com',
    position: 'Manager Keuangan',
    department: 'Keuangan',
    joinDate: '2020-01-15',
    avatarUrl: '',
    leaveBalance: 12,
    isActive: true,
    address: 'Jl. Merdeka No. 123, Jakarta',
    phone: '081234567890',
    pob: 'Jakarta',
    dob: '1985-05-20',
    religion: 'Islam',
    maritalStatus: 'Menikah',
    numberOfChildren: 2
  },
  {
    id: '2',
    nip: '987654321',
    name: 'Ani Lestari',
    email: 'ani.lestari@company.com',
    position: 'Staff HRD',
    department: 'SDM',
    joinDate: '2021-03-10',
    avatarUrl: '',
    leaveBalance: 8,
    isActive: true,
    address: 'Jl. Sudirman No. 456, Bandung',
    phone: '081987654321',
    pob: 'Bandung',
    dob: '1990-08-12',
    religion: 'Islam',
    maritalStatus: 'Lajang',
    numberOfChildren: 0
  },
  {
    id: '3',
    nip: '456789123',
    name: 'Dedi Hidayat',
    email: 'dedi.hidayat@company.com',
    position: 'Supervisor IT',
    department: 'Teknologi Informasi',
    joinDate: '2019-11-05',
    avatarUrl: '',
    leaveBalance: 10,
    isActive: false,
    address: 'Jl. Thamrin No. 789, Surabaya',
    phone: '085678912345',
    pob: 'Surabaya',
    dob: '1988-12-03',
    religion: 'Islam',
    maritalStatus: 'Menikah',
    numberOfChildren: 1
  }
];

export const mockRiwayatJabatan = [
  {
    id: 1,
    pegawai_id: 1,
    jabatan_lama: 'Staff Keuangan',
    jabatan_baru: 'Manager Keuangan',
    tanggal_perubahan: '2022-01-15',
    unit_kerja: 'Keuangan'
  },
  {
    id: 2,
    pegawai_id: 1,
    jabatan_lama: 'Junior Staff Keuangan',
    jabatan_baru: 'Staff Keuangan',
    tanggal_perubahan: '2021-01-15',
    unit_kerja: 'Keuangan'
  }
];

export const mockPelatihan = [
  {
    id: 1,
    pegawai_id: 1,
    nama_pelatihan: 'Manajemen Keuangan Lanjutan',
    penyelenggara: 'Universitas Indonesia',
    tanggal_mulai: '2022-05-10',
    tanggal_selesai: '2022-05-15',
    nomor_sertifikat: 'UI-2022-001',
    durasi: '40 jam',
    deskripsi: 'Pelatihan untuk meningkatkan kemampuan manajemen keuangan'
  },
  {
    id: 2,
    pegawai_id: 1,
    nama_pelatihan: 'Leadership Development',
    penyelenggara: 'Harvard Business School',
    tanggal_mulai: '2021-09-20',
    tanggal_selesai: '2021-09-25',
    nomor_sertifikat: 'HBS-2021-045',
    durasi: '30 jam',
    deskripsi: 'Program pengembangan kepemimpinan untuk manajer'
  }
];