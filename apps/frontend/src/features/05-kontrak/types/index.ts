export interface Kontrak {
  id: string;
  employeeId: string;
  employeeName?: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  contractType: string;
  status: string;
  contractFile: string;
  terms: string;
  salary: number;
  notes: string;
  createdAt: string;
  pangkat?: string;
  golongan?: string;
  tanggalCalonPegawai?: string;
  tanggalKenaikanPangkatTerakhir?: string;
  tanggalKenaikanPangkatSelanjutnya?: string;
  tanggalKenaikanGajiBerkala?: string;
}
