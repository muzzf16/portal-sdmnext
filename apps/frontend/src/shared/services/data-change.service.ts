import api from './api';

export const submitDataChangeRequest = (employeeId: string, requestedChanges: string) => {
  return api.post('/data-change-requests', { employeeId, requestedChanges });
};

export const getDataChangeRequests = () => {
    return api.get('/data-change-requests');
};

export const handleDataChangeRequest = (id: number, status: string, reviewNotes: string) => {
    return api.patch(`/data-change-requests/${id}/handle`, { status, reviewNotes });
};
