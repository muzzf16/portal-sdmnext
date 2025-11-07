import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getPenggajian } from '../api/penggajianApi';
import { Penggajian } from '../types';
import DetailPenggajian from '../components/DetailPenggajian';
import { Card } from '../../../shared/components/ui/Card';
import { Select } from '../../../shared/components/ui/Select';
import { Button } from '../../../shared/components/ui/Button';
import { useCompanySettings } from '../../pengaturan/hooks/useCompanySettings';
import { usePegawai } from '../../01-pegawai/hooks/usePegawai';
import { printPayslip } from '../utils/printPayslip';

const HalamanPenggajianSaya: React.FC = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState<Penggajian[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedPayroll, setSelectedPayroll] = useState<Penggajian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: companySettings } = useCompanySettings();
  console.log('Company Settings:', companySettings);
  const { pegawai } = usePegawai(user?.employeeId || '');

  useEffect(() => {
    const fetchPayrolls = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await getPenggajian({});
        const userPayrolls = data.filter(p => p.employeeId === user.employeeId);
        setPayrolls(userPayrolls);
        if (userPayrolls.length > 0) {
          const latestPeriod = userPayrolls.reduce((latest, p) => (p.period > latest ? p.period : latest), userPayrolls[0].period);
          setSelectedPeriod(latestPeriod);
        }
        setLoading(false);
      } catch (err) {
        setError('Gagal memuat data penggajian');
        setLoading(false);
      }
    };

    fetchPayrolls();
  }, [user]);

  useEffect(() => {
    if (selectedPeriod) {
      const payroll = payrolls.find(p => p.period === selectedPeriod);
      setSelectedPayroll(payroll || null);
    }
  }, [selectedPeriod, payrolls]);

  const handlePrintPayslip = () => {
    if (!selectedPayroll || !pegawai) {
      alert('Pilih periode gaji terlebih dahulu atau data pegawai tidak ditemukan.');
      return;
    }
    printPayslip(selectedPayroll, pegawai, companySettings);
  };

  const availablePeriods = [...new Set(payrolls.map(p => p.period))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-primary-dark-blue mb-6">Penggajian Saya</h1>

      <Card className="p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Pilih Periode</h2>
        <div className="flex items-center space-x-4">
          <Select
            id="periode-gaji"
            label="Periode Gaji"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={availablePeriods.map(p => ({ value: p, label: p }))}
            className="w-[280px]"
          />
          <Button onClick={handlePrintPayslip} disabled={!selectedPayroll}>
            Cetak Slip Gaji
          </Button>
        </div>
      </Card>

      {loading && <p>Memuat data penggajian...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && selectedPayroll && (
        <DetailPenggajian payrollId={selectedPayroll.id} />
      )}

      {!loading && !selectedPayroll && (
        <Card className="p-6">
          <p>Data gaji untuk periode yang dipilih tidak ditemukan.</p>
        </Card>
      )}
    </div>
  );
};

export default HalamanPenggajianSaya;
