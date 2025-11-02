import { openDb } from '../../config/db';
import { DataChangeRequest } from './permintaanPerubahanData.model';

export const createRequest = async (request: DataChangeRequest): Promise<number | undefined> => {
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO data_change_requests (employeeId, requestedChanges) VALUES (?, ?)',
    [request.employeeId, request.requestedChanges]
  );
  return result.lastID;
};

export const findAllRequests = async (): Promise<DataChangeRequest[]> => {
  const db = await openDb();
  return db.all('SELECT * FROM data_change_requests ORDER BY createdAt DESC');
};

export const findRequestById = async (id: number): Promise<DataChangeRequest | undefined> => {
    const db = await openDb();
    return db.get('SELECT * FROM data_change_requests WHERE id = ?', id);
};

export const updateRequestStatus = async (id: number, status: string, reviewedBy: string, reviewNotes: string): Promise<void> => {
    const db = await openDb();
    await db.run(
        'UPDATE data_change_requests SET status = ?, reviewedBy = ?, reviewNotes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [status, reviewedBy, reviewNotes, id]
    );
};