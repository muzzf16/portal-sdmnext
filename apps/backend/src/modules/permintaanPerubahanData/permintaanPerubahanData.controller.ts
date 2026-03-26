import { Request, Response, NextFunction } from 'express';
import * as service from './permintaanPerubahanData.service';

export const submitRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestedChanges } = req.body;
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(401).json({ message: 'Employee identity is required' });
    }
    const newRequestId = await service.createChangeRequest({ employeeId, requestedChanges });
    return res.status(201).json({ message: 'Request submitted successfully', id: newRequestId });
  } catch (error) {
    return next(error);
  }
};

export const getRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await service.getAllChangeRequests();
    return res.json(requests);
  } catch (error) {
    return next(error);
  }
};

export const handleRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes } = req.body;
        const reviewedBy = req.user?.id;
        if (!reviewedBy) {
            return res.status(401).json({ message: 'Reviewer identity is required' });
        }

        await service.processChangeRequest(Number(id), status, reviewedBy, reviewNotes);
        return res.status(200).json({ message: `Request ${status} successfully` });
    } catch (error) {
        return next(error);
    }
};
