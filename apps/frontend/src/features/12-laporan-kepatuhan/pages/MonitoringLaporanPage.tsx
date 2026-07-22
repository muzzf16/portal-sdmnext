import React from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Shield, Calendar, Clock, CheckCircle, FileText } from 'lucide-react';
import { useMyLaporan, useUpdateLaporan } from '../hooks/useLaporanKepatuhan';

const MonitoringLaporanPage: React.FC = () => {
  const { data: laporan = [], isLoading } = useMyLaporan();
  const updateMutation = useUpdateLaporan();

  const handleTandaiSelesai = (id: number) => {
    if (window.confirm('Tandai laporan ini sebagai Selesai?')) {
      updateMutation.mutate({ id, data: { status: 'completed' } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-indigo-900">Monitoring Laporan Kepatuhan</h2>
            <p className="text-sm text-indigo-700">Daftar laporan OJK/Regulator yang menjadi tanggung jawab Anda.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></span>
          </div>
        ) : laporan.length === 0 ? (
          <div className="col-span-full text-center py-8 bg-white border border-neutral-200 rounded-xl">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">Belum ada tugas pelaporan untuk Anda</p>
          </div>
        ) : (
          laporan.map((item) => {
            const isOverdue = item.status === 'pending' && new Date(item.batas_akhir) < new Date();
            const isCompleted = item.status === 'completed';

            return (
              <Card key={item.id} className={`p-5 flex flex-col justify-between border-t-4 ${isCompleted ? 'border-t-green-500' : isOverdue ? 'border-t-red-500' : 'border-t-amber-500'}`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant={isCompleted ? 'success' : isOverdue ? 'danger' : 'warning'} className="mb-2">
                      {isCompleted ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {isCompleted ? 'Selesai' : isOverdue ? 'Overdue' : 'Pending'}
                    </Badge>
                    <div className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                      {item.periode || 'Berkala'}
                    </div>
                  </div>
                  
                  <h3 className="text-base font-bold text-neutral-900 mb-1">{item.nama_laporan}</h3>
                  {item.ketentuan && <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{item.ketentuan}</p>}
                  
                  <div className="flex items-center text-sm text-neutral-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                    Batas Akhir: <span className="font-semibold ml-1">{new Date(item.batas_akhir).toLocaleDateString('id-ID')}</span>
                  </div>
                  
                  {item.tata_cara && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-600">
                      <strong>Tata Cara:</strong> {item.tata_cara}
                    </div>
                  )}
                </div>

                {!isCompleted && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={() => handleTandaiSelesai(item.id)}
                      loading={updateMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Tandai Selesai
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MonitoringLaporanPage;
