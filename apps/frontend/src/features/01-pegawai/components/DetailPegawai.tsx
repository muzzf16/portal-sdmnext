import React from 'react';
import { usePegawai } from '../hooks/usePegawai';
import { Link } from 'react-router-dom';

interface DetailPegawaiProps {
  employeeId: string | undefined;
}

const DetailPegawai: React.FC<DetailPegawaiProps> = ({ employeeId }) => {
  if (!employeeId) {
    return <div>Pegawai tidak ditemukan</div>;
  }

  const { pegawai, loading, error } = usePegawai(employeeId);

  if (loading) return <div>Memuat...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!pegawai) return <div>Pegawai tidak ditemukan</div>;

  return (
    <div className="mt-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-start space-x-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200">
              {pegawai.avatarUrl ? (
                <img 
                  src={pegawai.avatarUrl} 
                  alt={`${pegawai.name}'s profile`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <span className="text-slate-500">No Photo</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Employee Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary-dark-blue mb-2">{pegawai.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <p><strong>NIP:</strong> {pegawai.nip}</p>
              <p><strong>Posisi:</strong> {pegawai.position}</p>
              <p><strong>Pangkat:</strong> {pegawai.pangkat || '-'}</p>
              <p><strong>Golongan:</strong> {pegawai.golongan || '-'}</p>
              <p><strong>Departemen:</strong> {pegawai.department}</p>
              <p><strong>Jenis Kelamin:</strong> 
                {pegawai.jenis_kelamin === 'L' ? ' Laki-laki' : 
                 pegawai.jenis_kelamin === 'P' ? ' Perempuan' : ' Tidak Ditentukan'}
              </p>
              <p><strong>Email:</strong> {pegawai.email}</p>
              <p><strong>Tanggal Bergabung:</strong> {new Date(pegawai.joinDate).toLocaleDateString('id-ID')}</p>
              <p><strong>No. Telepon:</strong> {pegawai.phone || '-'}</p>
              <p><strong>Tempat/Tanggal Lahir:</strong> {pegawai.pob}, {pegawai.dob ? new Date(pegawai.dob).toLocaleDateString('id-ID') : '-'}</p>
              <p><strong>Agama:</strong> {pegawai.religion || '-'}</p>
              <p><strong>Status Perkawinan:</strong> {pegawai.maritalStatus || '-'}</p>
              <p><strong>Jumlah Anak:</strong> {pegawai.numberOfChildren || 0}</p>
              <p><strong>Alamat:</strong> {pegawai.address || '-'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link to={`/dashboard/pegawai/${employeeId}/riwayat-jabatan`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Riwayat Jabatan
          </Link>
          <Link to={`/dashboard/pegawai/${employeeId}/pelatihan`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Riwayat Pelatihan
          </Link>
          <Link to={`/dashboard/pegawai/${employeeId}/orientasi`} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Tugas Orientasi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DetailPegawai;
