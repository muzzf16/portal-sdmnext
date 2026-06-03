import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { KreditBerkas } from '../types';
import { Clock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface KreditBerkasPendingProps {
    items: (KreditBerkas & { stage_received_at: string })[];
    onProcess: (berkas: KreditBerkas) => void;
    isLoading?: boolean;
    userPosition?: string;
    userRole?: string;
}

const STAGE_LABELS: Record<string, string> = {
    'penerimaan': 'Penerimaan Berkas',
    'slik': 'Pengecekan SLIK',
    'delegasi_survey': 'Delegasi Survey',
    'ots': 'Survey Lapangan (OTS)',
    'komite_kredit': 'Komite Kredit',
    'mak_agunan': 'Analisa MAK & Agunan',
    'approval_keputusan': 'Persetujuan & Keputusan Final',
    'admin_spk': 'Pembuatan SPK',
    'pencairan': 'Pencairan',
    'selesai': 'Selesai',
    'ditolak_cs': 'Ditolak - Penanganan CS',
    // Legacy
    'analisa': 'Analisa & Survey',
    'verifikasi': 'Verifikasi & Approval',
    'admin_pencairan': 'Admin & Pencairan'
};

export const KreditBerkasPending: React.FC<KreditBerkasPendingProps> = ({
    items,
    onProcess,
    isLoading,
    userPosition = '',
    userRole = ''
}) => {
    const [expanded, setExpanded] = useState(false);
    const pos = (userPosition || '').toLowerCase();

    const canProcessItem = (item: KreditBerkas) => {
        if (!item) return false;
        if (userRole === 'admin') return true;
        
        const stage = item.current_stage || '';
        const p = pos;
        
        // 1. Penerimaan
        if (stage === 'penerimaan' && (p.includes('cs') || p.includes('customer service'))) return true;
        
        // 2. SLIK
        if (stage === 'slik' && (p.includes('adminitrasi') || p.includes('adm kredit'))) return true;
        
        // 3. Delegasi Survey
        if (stage === 'delegasi_survey' && p.includes('kabid kredit')) return true;
        
        // 4. OTS (Survey)
        if (stage === 'ots' && (p.includes('marketing') || p.includes('analis'))) return true;
        
        // 5. Komite Kredit
        if (stage === 'komite_kredit' && p.includes('kabid kredit')) return true;
        
        // 6. MAK & Agunan
        if (stage === 'mak_agunan' && (p.includes('marketing') || p.includes('analis'))) return true;
        
        // 7. Approval & Keputusan Final
        if (stage === 'approval_keputusan' && p.includes('kabid kredit')) return true;
        
        // 8. Admin SPK
        if (stage === 'admin_spk' && (p.includes('adminitrasi') || p.includes('adm kredit'))) return true;
        
        // 9. Pencairan
        if (stage === 'pencairan' && (p.includes('teller') || p.includes('kasir') || p.includes('adminitrasi') || p.includes('adm kredit'))) return true;
        
        // Penanganan Tolak (CS)
        if (stage === 'ditolak_cs' && (p.includes('cs') || p.includes('customer service'))) return true;

        // Legacy support
        if (stage === 'analisa' && (p.includes('marketing') || p.includes('analis'))) return true;
        if (stage === 'verifikasi' && p.includes('kabid kredit')) return true;
        if (stage === 'admin_pencairan' && (p.includes('adminitrasi') || p.includes('adm kredit'))) return true;
        
        return false;
    };

    // All hooks MUST be called before any early return
    const actionableItems = useMemo(() => items.filter(i => canProcessItem(i)), [items, pos, userRole]);
    const otherItems = useMemo(() => items.filter(i => !canProcessItem(i)), [items, pos, userRole]);

    if (items.length === 0) return null;

    const getTimeDiff = (dateStr: string) => {
        const received = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - received.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHrs / 24);

        if (diffDays > 0) return `${diffDays} hari`;
        if (diffHrs > 0) return `${diffHrs} jam`;
        return 'Baru saja';
    };

    const renderItem = (item: KreditBerkas & { stage_received_at: string }, canDo: boolean) => {
        const stage = item.current_stage || '';
        const isDitolakCs = stage === 'ditolak_cs';
        return (
            <div key={item.id} className="px-3 py-2 hover:bg-gray-50 transition-colors flex justify-between items-center gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-400">{item.nomor_pengajuan}</span>
                        <span className="text-xs font-bold text-gray-800 truncate">{item.nama_pengajuan}</span>
                        <Badge 
                            variant={isDitolakCs ? 'danger' : 'info'} 
                            className={clsx(
                                "text-[7px] uppercase py-0 leading-3 flex-shrink-0",
                                isDitolakCs && "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                            )}
                        >
                            {STAGE_LABELS[stage] || stage.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className="flex gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span>{getTimeDiff(item.stage_received_at || new Date().toISOString())}</span>
                        <span className="font-medium text-indigo-500">Rp {(item.jumlah_pengajuan || 0).toLocaleString('id-ID')}</span>
                    </div>
                </div>
                {canDo ? (
                    <Button 
                        size="xs" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-[10px] px-2 py-1 h-6 flex-shrink-0"
                        onClick={() => onProcess(item)}
                        disabled={isLoading}
                    >
                        <ArrowRight className="w-3 h-3 mr-0.5" />
                        Proses
                    </Button>
                ) : (
                    <span className="text-[9px] text-gray-300 italic flex-shrink-0">Menunggu...</span>
                )}
            </div>
        );
    };

    return (
        <Card className="shadow-sm border-l-4 border-l-amber-500 overflow-hidden flex-shrink-0">
            {/* Header - always visible, clickable to toggle */}
            <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full bg-amber-50 px-3 py-2 border-b border-amber-100 flex justify-between items-center hover:bg-amber-100/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <h3 className="font-bold text-amber-900 text-xs">Monitoring Kredit</h3>
                    <Badge variant="warning" className="text-[9px]">{items.length}</Badge>
                    {actionableItems.length > 0 && (
                        <Badge variant="danger" className="text-[9px] animate-pulse">{actionableItems.length} perlu proses</Badge>
                    )}
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
            </button>

            {/* Collapsed: show only actionable items (compact) */}
            {!expanded && actionableItems.length > 0 && (
                <div className="divide-y divide-gray-50 max-h-28 overflow-y-auto">
                    {actionableItems.map(item => renderItem(item, true))}
                </div>
            )}

            {/* Expanded: show all items */}
            {expanded && (
                <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                    {actionableItems.map(item => renderItem(item, true))}
                    {otherItems.length > 0 && (
                        <>
                            <div className="px-3 py-1 bg-gray-50 text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
                                Berkas di tahap lain ({otherItems.length})
                            </div>
                            {otherItems.map(item => renderItem(item, false))}
                        </>
                    )}
                </div>
            )}

            {/* No actionable & collapsed: show a single-line summary */}
            {!expanded && actionableItems.length === 0 && (
                <div className="px-3 py-1.5 text-[10px] text-gray-400 italic">
                    {items.length} berkas sedang diproses di tahap lain.
                </div>
            )}
        </Card>
    );
};
