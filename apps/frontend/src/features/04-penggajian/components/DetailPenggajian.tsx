import React from 'react';
import { usePenggajian } from '../hooks/usePenggajian';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface DetailPenggajianProps {
  payrollId: string | undefined;
}

const DetailPenggajian: React.FC<DetailPenggajianProps> = ({ payrollId }) => {

  if (!payrollId) {
    return <div className="flex justify-center items-center h-64">
      <p className="text-gray-500 text-lg">Data penggajian tidak ditemukan</p>
    </div>;
  }

  const { penggajian, loading, error } = usePenggajian(payrollId);

  // Calculate totals
  const totalIncome = penggajian?.incomes.reduce((sum, income) => sum + income.amount, 0) || 0;
  const totalDeductions = penggajian?.deductions.reduce((sum, deduction) => sum + deduction.amount, 0) || 0;
  const grossSalary = (penggajian?.baseSalary || 0) + totalIncome;
  const netSalary = grossSalary - totalDeductions;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Memuat...</span>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-64">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error.message}</span>
      </div>
    </div>
  );
  
  if (!penggajian) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-500 text-lg">Data penggajian tidak ditemukan</p>
    </div>
  );

  return (
    <div className="mt-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/dashboard/penggajian" 
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Daftar Penggajian
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{penggajian.employeeName}</h2>
              <p className="text-blue-100">{penggajian.period}</p>
            </div>
            
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Gaji Pokok</p>
              <p className="text-xl font-bold text-gray-800">
                  `Rp ${penggajian.baseSalary.toLocaleString()}`
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Tunjangan</p>
              <p className="text-xl font-bold text-green-600">Rp {totalIncome.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Potongan</p>
              <p className="text-xl font-bold text-red-600">Rp {totalDeductions.toLocaleString()}</p>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg shadow border border-blue-200">
              <p className="text-blue-800 text-sm">Gaji Bersih</p>
              <p className="text-xl font-bold text-blue-900">Rp {netSalary.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        {/* Detailed Salary Components */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Allowances Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Tunjangan</h3>
              </div>
              
              <div className="space-y-3">
                {penggajian.incomes.length === 0 ? (
                  <p className="text-gray-500 italic">Belum ada tunjangan</p>
                ) : (
                  penggajian.incomes.map((income, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{income.name}</p>
                            <p className="text-sm text-gray-500">Tunjangan</p>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold text-green-600 mr-4">Rp {income.amount.toLocaleString()}</span>
                          </div>
                        </>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Deductions Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Potongan</h3>
              </div>
              
              <div className="space-y-3">
                {penggajian.deductions.length === 0 ? (
                  <p className="text-gray-500 italic">Belum ada potongan</p>
                ) : (
                  penggajian.deductions.map((deduction, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{deduction.name}</p>
                            <p className="text-sm text-gray-500">Potongan</p>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold text-red-600 mr-4">Rp {deduction.amount.toLocaleString()}</span>
                          </div>
                        </>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPenggajian;
