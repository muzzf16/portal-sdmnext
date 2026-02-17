import React, { useState, useEffect } from 'react';
import { usePenggajian } from '../hooks/usePenggajian';
import { updatePenggajian, updateStatus } from '../api/penggajianApi';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/shared/contexts/AuthContext';

interface DetailPenggajianProps {
  payrollId: string | undefined;
}

interface FormValues {
  baseSalary: number;
  incomes: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
}

export const DetailPenggajian: React.FC<DetailPenggajianProps> = ({ payrollId }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    baseSalary: 0,
    incomes: [],
    deductions: []
  });
  const [editingComponentIndex, setEditingComponentIndex] = useState<{ type: 'income' | 'deduction', index: number } | null>(null);
  const [editingComponent, setEditingComponent] = useState<{ name: string; amount: number } | null>(null);

  if (!payrollId) {
    return <div className="flex justify-center items-center h-64">
      <p className="text-gray-500 text-lg">Data penggajian tidak ditemukan</p>
    </div>;
  }

  const { penggajian, loading, error, setPenggajian } = usePenggajian(payrollId);

  useEffect(() => {
    if (penggajian) {
      setFormValues({
        baseSalary: penggajian.baseSalary,
        incomes: [...penggajian.incomes],
        deductions: [...penggajian.deductions]
      });
    }
  }, [penggajian]);

  const handleEditClick = () => {
    if (penggajian) {
      setIsEditing(true);
      setFormValues({
        baseSalary: penggajian.baseSalary,
        incomes: [...penggajian.incomes],
        deductions: [...penggajian.deductions]
      });
    }
  };

  const handleStatusUpdate = async (newStatus: 'Draft' | 'Final' | 'Paid') => {
    if (!penggajian) return;
    try {
      await updateStatus(penggajian.id, newStatus);
      setPenggajian({ ...penggajian, status: newStatus });
      alert(`Status updated to ${newStatus}`);
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Gagal update status");
    }
  };

  const handleSaveClick = async () => {
    if (!penggajian) return;

    try {
      const updatedPayrollData = {
        employeeId: penggajian.employeeId,
        employeeName: penggajian.employeeName,
        period: penggajian.period,
        baseSalary: formValues.baseSalary,
        incomes: formValues.incomes,
        deductions: formValues.deductions
      };

      const { data: updatedPayroll } = await updatePenggajian(penggajian.id, updatedPayrollData);
      setPenggajian(updatedPayroll);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update payroll', error);
      alert('Gagal memperbarui penggajian');
    }
  };

  const handleCancelClick = () => {
    if (penggajian) {
      setFormValues({
        baseSalary: penggajian.baseSalary,
        incomes: [...penggajian.incomes],
        deductions: [...penggajian.deductions]
      });
    }
    setIsEditing(false);
    setEditingComponentIndex(null);
    setEditingComponent(null);
  };

  const handleBaseSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({
      ...prev,
      baseSalary: Number(e.target.value)
    }));
  };

  const addIncome = () => {
    setFormValues(prev => ({
      ...prev,
      incomes: [...prev.incomes, { name: '', amount: 0 }]
    }));
    const newIndex = formValues.incomes.length;
    setEditingComponentIndex({ type: 'income', index: newIndex });
    setEditingComponent({ name: '', amount: 0 });
  };

  const addDeduction = () => {
    setFormValues(prev => ({
      ...prev,
      deductions: [...prev.deductions, { name: '', amount: 0 }]
    }));
    const newIndex = formValues.deductions.length;
    setEditingComponentIndex({ type: 'deduction', index: newIndex });
    setEditingComponent({ name: '', amount: 0 });
  };

  const updateIncome = (index: number, field: 'name' | 'amount', value: string | number) => {
    setFormValues(prev => {
      const updatedIncomes = [...prev.incomes];
      updatedIncomes[index] = {
        ...updatedIncomes[index],
        [field]: typeof value === 'string' ? value : Number(value)
      };
      return { ...prev, incomes: updatedIncomes };
    });
  };

  const updateDeduction = (index: number, field: 'name' | 'amount', value: string | number) => {
    setFormValues(prev => {
      const updatedDeductions = [...prev.deductions];
      updatedDeductions[index] = {
        ...updatedDeductions[index],
        [field]: typeof value === 'string' ? value : Number(value)
      };
      return { ...prev, deductions: updatedDeductions };
    });
  };

  const deleteIncome = (index: number) => {
    setFormValues(prev => {
      const updatedIncomes = [...prev.incomes];
      updatedIncomes.splice(index, 1);
      return { ...prev, incomes: updatedIncomes };
    });
  };

  const deleteDeduction = (index: number) => {
    setFormValues(prev => {
      const updatedDeductions = [...prev.deductions];
      updatedDeductions.splice(index, 1);
      return { ...prev, deductions: updatedDeductions };
    });
  };

  const startEditingComponent = (type: 'income' | 'deduction', index: number) => {
    const component = type === 'income' ? formValues.incomes[index] : formValues.deductions[index];
    setEditingComponentIndex({ type, index });
    setEditingComponent({ ...component });
  };

  const saveComponentEdit = () => {
    if (editingComponentIndex && editingComponent) {
      if (editingComponentIndex.type === 'income') {
        updateIncome(editingComponentIndex.index, 'name', editingComponent.name);
        updateIncome(editingComponentIndex.index, 'amount', editingComponent.amount);
      } else {
        updateDeduction(editingComponentIndex.index, 'name', editingComponent.name);
        updateDeduction(editingComponentIndex.index, 'amount', editingComponent.amount);
      }
      setEditingComponentIndex(null);
      setEditingComponent(null);
    }
  };

  const cancelComponentEdit = () => {
    setEditingComponentIndex(null);
    setEditingComponent(null);
  };

  const updateEditingComponent = (field: 'name' | 'amount', value: string) => {
    if (editingComponent) {
      setEditingComponent({
        ...editingComponent,
        [field]: field === 'amount' ? Number(value) : value
      });
    }
  };

  // Calculate totals
  const totalIncome = formValues.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalDeductions = formValues.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  const grossSalary = formValues.baseSalary + totalIncome;
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
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{penggajian.employeeName}</h2>
                <span className={`px-2 py-1 text-xs rounded-full font-bold ${penggajian.status === 'Draft' ? 'bg-yellow-400 text-yellow-900' :
                    penggajian.status === 'Final' ? 'bg-green-400 text-green-900' :
                      'bg-blue-400 text-blue-900'
                  }`}>
                  {penggajian.status || 'Draft'}
                </span>
              </div>
              <p className="text-blue-100">{penggajian.period}</p>
            </div>

            {user?.role === 'admin' && (
              <div className="flex space-x-3">
                {penggajian.status === 'Draft' && (
                  <button
                    onClick={() => handleStatusUpdate('Final')}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow-lg border-2 border-green-400"
                  >
                    Approve / Finalize
                  </button>
                )}
                {penggajian.status === 'Final' && (
                  <button
                    onClick={() => handleStatusUpdate('Paid')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-lg border-2 border-blue-400"
                  >
                    Mark as Paid
                  </button>
                )}

                {!isEditing ? (
                  <button
                    onClick={handleEditClick}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                  >
                    Edit Penggajian
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveClick}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
                    >
                      Batal
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary Card */}
        <div className="p-6 pb-0 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col items-center">
            <span className="text-indigo-600 font-semibold">Total Kehadiran</span>
            <span className="text-2xl font-bold text-indigo-900">{penggajian.totalAttendance || 0} Hari</span>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex flex-col items-center">
            <span className="text-orange-600 font-semibold">Total Lembur</span>
            <span className="text-2xl font-bold text-orange-900">{penggajian.totalOvertime || 0} Jam</span>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col items-center">
            <span className="text-red-600 font-semibold">Keterlambatan</span>
            <span className="text-2xl font-bold text-red-900">{penggajian.totalLateness || 0} Kali</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Gaji Pokok</p>
              <p className="text-xl font-bold text-gray-800">
                {isEditing && user?.role === 'admin' ? (
                  <input
                    type="number"
                    value={formValues.baseSalary}
                    onChange={handleBaseSalaryChange}
                    className="w-full border rounded px-2 py-1 text-gray-800"
                  />
                ) : (
                  `Rp ${formValues.baseSalary.toLocaleString()}`
                )}
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
                {isEditing && user?.role === 'admin' && (
                  <button
                    onClick={addIncome}
                    className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <span className="mr-1">+</span> Tambah Tunjangan
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {formValues.incomes.length === 0 ? (
                  <p className="text-gray-500 italic">Belum ada tunjangan</p>
                ) : (
                  formValues.incomes.map((income, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      {editingComponentIndex?.type === 'income' && editingComponentIndex.index === index && user?.role === 'admin' ? (
                        <div className="flex-1 flex flex-col gap-2">
                          <input
                            type="text"
                            value={editingComponent?.name || ''}
                            onChange={(e) => updateEditingComponent('name', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-gray-800"
                            placeholder="Nama tunjangan"
                          />
                          <div className="flex">
                            <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l text-gray-600">Rp</span>
                            <input
                              type="number"
                              value={editingComponent?.amount || 0}
                              onChange={(e) => updateEditingComponent('amount', e.target.value)}
                              className="border rounded-r px-2 py-1 w-full"
                              placeholder="Jumlah"
                            />
                          </div>
                          <div className="flex space-x-2 self-end">
                            <button
                              onClick={saveComponentEdit}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={cancelComponentEdit}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{income.name}</p>
                            <p className="text-sm text-gray-500">Tunjangan</p>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold text-green-600 mr-4">Rp {income.amount.toLocaleString()}</span>
                            {isEditing && user?.role === 'admin' && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => startEditingComponent('income', index)}
                                  className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                                  title="Edit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteIncome(index)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                  title="Hapus"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Deductions Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Potongan</h3>
                {isEditing && user?.role === 'admin' && (
                  <button
                    onClick={addDeduction}
                    className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    <span className="mr-1">+</span> Tambah Potongan
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {formValues.deductions.length === 0 ? (
                  <p className="text-gray-500 italic">Belum ada potongan</p>
                ) : (
                  formValues.deductions.map((deduction, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      {editingComponentIndex?.type === 'deduction' && editingComponentIndex.index === index && user?.role === 'admin' ? (
                        <div className="flex-1 flex flex-col gap-2">
                          <input
                            type="text"
                            value={editingComponent?.name || ''}
                            onChange={(e) => updateEditingComponent('name', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-gray-800"
                            placeholder="Nama potongan"
                          />
                          <div className="flex">
                            <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l text-gray-600">Rp</span>
                            <input
                              type="number"
                              value={editingComponent?.amount || 0}
                              onChange={(e) => updateEditingComponent('amount', e.target.value)}
                              className="border rounded-r px-2 py-1 w-full"
                              placeholder="Jumlah"
                            />
                          </div>
                          <div className="flex space-x-2 self-end">
                            <button
                              onClick={saveComponentEdit}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={cancelComponentEdit}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{deduction.name}</p>
                            <p className="text-sm text-gray-500">Potongan</p>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold text-red-600 mr-4">Rp {deduction.amount.toLocaleString()}</span>
                            {isEditing && user?.role === 'admin' && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => startEditingComponent('deduction', index)}
                                  className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                                  title="Edit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteDeduction(index)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                  title="Hapus"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
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
