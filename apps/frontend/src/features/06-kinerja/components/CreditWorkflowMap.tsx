import React from 'react';
import { KreditBerkas, KreditStage } from '../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import clsx from 'clsx';

interface CreditWorkflowMapProps {
    data: KreditBerkas[];
    selectedBerkas?: KreditBerkas;
}

const STAGES: { key: KreditStage; label: string; icon: any }[] = [
    { key: 'penerimaan', label: 'Penerimaan', icon: Clock },
    { key: 'slik', label: 'SLIK/iDEB', icon: Clock },
    { key: 'delegasi_survey', label: 'Delegasi', icon: Clock },
    { key: 'ots', label: 'Survey OTS', icon: Clock },
    { key: 'komite_kredit', label: 'Komite', icon: Clock },
    { key: 'mak_agunan', label: 'MAK Agunan', icon: Clock },
    { key: 'approval_keputusan', label: 'Approval', icon: Clock },
    { key: 'admin_spk', label: 'Admin SPK', icon: Clock },
    { key: 'pencairan', label: 'Pencairan', icon: Clock },
];

export const CreditWorkflowMap: React.FC<CreditWorkflowMapProps> = ({ data, selectedBerkas }) => {
    // Count filings per stage
    const stageCounts = data.reduce((acc, b) => {
        if (b.overall_status === 'dalam_proses') {
            acc[b.current_stage] = (acc[b.current_stage] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const getStageIndex = (stage: string) => STAGES.findIndex(s => s.key === stage);
    const selectedIndex = selectedBerkas ? getStageIndex(selectedBerkas.current_stage) : -1;

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Map Status Alur Kredit</h3>
                    <p className="text-sm text-gray-500">Visualisasi realtime posisi berkas dalam 9 tahapan pipeline.</p>
                </div>
                {selectedBerkas && (
                    <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <div className="bg-indigo-600 p-1.5 rounded-full"><Clock className="w-4 h-4 text-white" /></div>
                        <div>
                            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Sedang Dilihat</div>
                            <div className="text-sm font-bold text-indigo-900">{selectedBerkas.nama_pengajuan}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                {/* Connection Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0 hidden lg:block"></div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:justify-between gap-6 relative z-10">
                    {STAGES.map((stage, index) => {
                        const count = stageCounts[stage.key] || 0;
                        const isSelected = selectedBerkas?.current_stage === stage.key;
                        const isPast = selectedIndex > index;
                        
                        return (
                            <div key={stage.key} className="flex flex-col items-center flex-1 min-w-[100px]">
                                {/* Node */}
                                <div 
                                    className={clsx(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 shadow-sm mb-3",
                                        isSelected 
                                            ? "bg-indigo-600 border-indigo-200 scale-110 ring-4 ring-indigo-50" 
                                            : isPast 
                                                ? "bg-green-500 border-green-100" 
                                                : "bg-white border-gray-100"
                                    )}
                                >
                                    {isPast ? (
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    ) : isSelected ? (
                                        <div className="relative">
                                            <div className="absolute inset-0 animate-ping rounded-full bg-white opacity-25"></div>
                                            <Circle className="w-6 h-6 text-white fill-white" />
                                        </div>
                                    ) : (
                                        <span className={clsx("text-sm font-bold", count > 0 ? "text-indigo-600" : "text-gray-300")}>
                                            {index + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Label */}
                                <div className="text-center">
                                    <div className={clsx(
                                        "text-[11px] font-bold uppercase tracking-tight leading-tight mb-1",
                                        isSelected ? "text-indigo-600" : isPast ? "text-green-600" : "text-gray-400"
                                    )}>
                                        {stage.label}
                                    </div>
                                    
                                    {/* Stats Badge */}
                                    <div className={clsx(
                                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                                        count > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-50 text-gray-400"
                                    )}>
                                        {count} Berkas
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {selectedBerkas?.current_stage === 'ditolak_cs' && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-rose-500 text-white p-2 rounded-lg font-bold text-xs flex-shrink-0">⚠️ TOLAK CS</div>
                    <div>
                        <h4 className="text-sm font-bold text-rose-900">Berkas Dikembalikan Ke Customer Service</h4>
                        <p className="text-xs text-rose-700 mt-1">
                            Berkas pengajuan ini telah ditolak pada tahap sebelumnya dan dikembalikan ke antrean Customer Service untuk dilakukan penanganan, perbaikan dokumen, atau pembatalan pengajuan.
                        </p>
                    </div>
                </div>
            )}

            {/* Legend / Info */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div> Selesai / Lewat
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div> Posisi Saat Ini
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-100"></div> Menunggu Proses
                </div>
                <div className="ml-auto text-indigo-600">
                    💡 Klik baris pada tabel untuk melihat posisi berkas di diagram
                </div>
            </div>
        </div>
    );
};
