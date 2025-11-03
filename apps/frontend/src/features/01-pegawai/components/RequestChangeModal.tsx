import React, { useState } from 'react';
import { submitDataChangeRequest } from '@/shared/services/data-change.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
}

const RequestChangeModal: React.FC<Props> = ({ isOpen, onClose, employeeId }) => {
  const [requestedChanges, setRequestedChanges] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitDataChangeRequest(employeeId, requestedChanges);
      alert('Permintaan perubahan data berhasil dikirim.');
      onClose();
      setRequestedChanges('');
    } catch (error) {
      console.error('Failed to submit data change request:', error);
      alert('Gagal mengirim permintaan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ajukan Perubahan Data</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="requestedChanges" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jelaskan data apa yang ingin Anda ubah dan apa nilai barunya:
            </label>
            <textarea
              id="requestedChanges"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
              placeholder="Contoh: Ubah nomor telepon menjadi 081234567890"
              value={requestedChanges}
              onChange={(e) => setRequestedChanges(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestChangeModal;
