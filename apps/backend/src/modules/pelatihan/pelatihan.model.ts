// src/modules/pelatihan/pelatihan.model.ts

export interface Pelatihan {
  id?: number;
  pegawai_id: string;
  nama_pelatihan: string;
  penyelenggara: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nomor_sertifikat?: string;
  surat_jalan?: string;
  sppd?: string;
  surat_penawaran?: string;
  nama_peserta?: string;
}