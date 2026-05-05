import React from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { KreditBerkas } from '../types';
import { Clock, ArrowRight } from 'lucide-react';

interface KreditBerkasPendingProps {
    items: (KreditBerkas & { stage_received_at: string })[];
    onProcess: (berkas: KreditBerkas) => void;
    isLoading?: boolean;
}

export const KreditBerkasPending: React.FC<KreditBerkasPendingProps> = ({
    items,
    onProcess,
    isLoading
}) => {
    if (items.length === 0) return null;

    const getTimeDiff = (dateStr: string) => {
        const received = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - received.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHrs / 24);

        if (diffDays > 0) return `${diffDays} hari yang lalu`;
        if (diffHrs > 0) return `${diffHrs} jam yang lalu`;
        return 'Baru saja';
    };

    return (
        <Card className="mb-6 shadow-md border-l-4 border-l-amber-500 overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-1.5 rounded-full">
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-amber-900 text-sm">Berkas Kredit Menunggu Proses ({items.length})</h3>
                </div>
                <Badge variant="warning" className="text-[10px] animate-pulse">Perlu Tindakan</Badge>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {items.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{item.nomor_pengajuan}</span>
                                <h4 className="text-sm font-bold text-gray-800">{item.nama_pengajuan}</h4>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Masuk stage: {getTimeDiff(item.stage_received_at)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-[9px] uppercase">{item.jenis_kredit}</Badge>
                                </div>
                                <div className="font-semibold text-indigo-600">
                                    Rp {item.jumlah_pengajuan.toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs px-4"
                            onClick={() => onProcess(item)}
                            disabled={isLoading}
                        >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Proses Berkas
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
};
