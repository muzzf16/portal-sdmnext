import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { BookOpen, BarChart2, Target, Award, Briefcase, CalendarRange } from 'lucide-react';

// Lazy load tab content — reuse existing pages
const HalamanKinerjaContent = lazy(() => import('./HalamanKinerja'));
const ActivityLibraryContent = lazy(() => import('./ActivityLibraryPage'));
const WorkLoadContent = lazy(() => import('./WorkLoadPage'));
const KpiTargetContent = lazy(() => import('./KpiTargetPage'));
const AdminWlaSummaryContent = lazy(() => import('./AdminWlaSummaryPage'));
const LogWlaContent = lazy(() => import('./LogAktivitasWlaPage'));
const ManajemenTugasAtasanContent = lazy(() => import('./ManajemenTugasAtasanPage'));
const PerformanceCycleContent = lazy(() => import('./PerformanceCyclePage'));
const KreditMonitoringContent = lazy(() => import('./KreditMonitoringPage'));

interface TabDef {
    id: string;
    label: string;
    icon: React.ReactNode;
    roles: string[];
    component: React.ReactNode;
}

const TabSpinner = () => (
    <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
    </div>
);

const ManajemenKinerjaPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const role = user?.role || 'employee';

    const tabs: TabDef[] = useMemo(() => [
        // ── Fase 1: PERSIAPAN (Awal Periode) ──
        {
            id: 'perpustakaan',
            label: 'Perpustakaan Aktivitas',
            icon: <BookOpen size={18} />,
            roles: ['admin'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <ActivityLibraryContent />
                </Suspense>
            ),
        },
        {
            id: 'abk',
            label: 'Analisis Beban Kerja',
            icon: <BarChart2 size={18} />,
            roles: ['admin', 'employee', 'supervisor'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <WorkLoadContent />
                </Suspense>
            ),
        },
        {
            id: 'kpi',
            label: 'Manajemen KPI',
            icon: <Target size={18} />,
            roles: ['admin', 'supervisor', 'employee'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <KpiTargetContent />
                </Suspense>
            ),
        },
        // ── Fase 2: PEMANTAUAN (Sepanjang Periode) ──
        {
            id: 'log-wla',
            label: 'Entry WLA Harian',
            icon: <BookOpen size={18} />,
            roles: ['admin', 'supervisor', 'employee'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <LogWlaContent />
                </Suspense>
            ),
        },
        {
            id: 'rekap-wla',
            label: 'Rekap WLA Harian',
            icon: <BarChart2 size={18} />,
            roles: ['admin', 'supervisor'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <AdminWlaSummaryContent />
                </Suspense>
            ),
        },
        {
            id: 'penugasan',
            label: 'Penugasan Bawahan',
            icon: <Briefcase size={18} />,
            roles: ['admin', 'supervisor'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <ManajemenTugasAtasanContent />
                </Suspense>
            ),
        },
        // ── Fase 3-6: PENILAIAN & REVIEW (Akhir Periode) ──
        {
            id: 'monitoring-kredit',
            label: 'Monitoring Kredit',
            icon: <BarChart2 size={18} />,
            roles: ['admin', 'supervisor', 'employee'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <KreditMonitoringContent />
                </Suspense>
            ),
        },
        {
            id: 'penilaian',
            label: 'Penilaian Kinerja',
            icon: <Award size={18} />,
            roles: ['admin', 'supervisor'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <HalamanKinerjaContent />
                </Suspense>
            ),
        },
        {
            id: 'siklus',
            label: 'Siklus Kinerja',
            icon: <CalendarRange size={18} />,
            roles: ['admin', 'supervisor'],
            component: (
                <Suspense fallback={<TabSpinner />}>
                    <PerformanceCycleContent />
                </Suspense>
            ),
        },
    ], []);

    // Filter tabs by role
    const visibleTabs = useMemo(() => {
        return tabs.filter(tab => tab.roles.includes(role));
    }, [tabs, role]);

    // Default tab based on role
    const defaultTab = useMemo(() => {
        if (role === 'admin' || role === 'supervisor') return 'perpustakaan';
        return 'abk';
    }, [role]);

    // Active tab from URL or default
    const paramTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(() => {
        if (paramTab && visibleTabs.some(t => t.id === paramTab)) return paramTab;
        return defaultTab;
    });

    // Sync tab to URL
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId }, { replace: true });
    };

    const currentTab = visibleTabs.find(t => t.id === activeTab) || visibleTabs[0];

    return (
        <div className="min-h-screen print:min-h-0 print:h-auto">
            {/* Header */}
            <div className="mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-gray-900">📊 Manajemen Kinerja</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Kelola penilaian kinerja, beban kerja, dan target KPI dalam satu halaman.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6 print:hidden">
                <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Tabs">
                    {visibleTabs.map(tab => {
                        const isActive = currentTab?.id === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200
                  ${isActive
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {currentTab?.component}
            </div>
        </div>
    );
};

export default ManajemenKinerjaPage;
