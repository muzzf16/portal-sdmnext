import * as repository from './permintaanPerubahanData.repository';
import { DataChangeRequest } from './permintaanPerubahanData.model';
import NotifikasiService from '../notifikasi/notifikasi.service';
import { PenggunaRepository } from '../pengguna/pengguna.repository';
import { PegawaiRepository } from '../pegawai/pegawai.repository';

export const createChangeRequest = async (request: DataChangeRequest): Promise<number | undefined> => {
  const newRequestId = await repository.createRequest(request);

  // Create notification for all admins
  if (newRequestId) {
    const admins = await PenggunaRepository.findAdminUsers();
    const employee = await PegawaiRepository.findById(request.employeeId);

    for (const admin of admins) {
      await NotifikasiService.createNotifikasi({
        employee_id: admin.employeeId, // Notify the admin
        message: `Pegawai ${employee?.name} mengajukan permintaan perubahan data.`,
        type: 'info',
        related_entity: 'data_change_request',
        related_entity_id: newRequestId.toString(),
      });
    }
  }

  return newRequestId;
};

export const getAllChangeRequests = async (): Promise<DataChangeRequest[]> => {
  return repository.findAllRequests();
};

export const processChangeRequest = async (id: number, status: string, reviewedBy: string, reviewNotes: string): Promise<void> => {
    const request = await repository.findRequestById(id);
    if (!request) {
        throw new Error('Request not found');
    }

    await repository.updateRequestStatus(id, status, reviewedBy, reviewNotes);

    // Notify the employee who made the request
    await NotifikasiService.createNotifikasi({
        employee_id: request.employeeId,
        message: `Permintaan perubahan data Anda telah di-${status}.`,
        type: status === 'approved' ? 'success' : 'error',
        related_entity: 'data_change_request',
        related_entity_id: id.toString(),
    });
};