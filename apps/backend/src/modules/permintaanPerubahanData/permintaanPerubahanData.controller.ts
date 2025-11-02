import { Request, Response, NextFunction } from 'express';
import * as service from './permintaanPerubahanData.service';

export const submitRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestedChanges } = req.body;
    // @ts-ignore
    const employeeId = req.user.employeeId; 
    const newRequestId = await service.createChangeRequest({ employeeId, requestedChanges });
    res.status(201).json({ message: 'Request submitted successfully', id: newRequestId });
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await service.getAllChangeRequests();
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const handleRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes } = req.body;
        // @ts-ignore
        const reviewedBy = req.user.id; // Admin user ID

        await service.processChangeRequest(Number(id), status, reviewedBy, reviewNotes);
        res.status(200).json({ message: `Request ${status} successfully` });
    } catch (error) {
        next(error);
    }
};