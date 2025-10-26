// src/modules/kontrak/kontrak.controller.ts
import KontrakService from './kontrak.service';
import { Request, Response, NextFunction } from 'express';

class KontrakController {
  // Contract Management Methods
  static async getAllContracts(req: Request, res: Response, next: NextFunction) {
    try {
      const contracts = await KontrakService.getAllContracts();
      res.status(200).json({
        success: true,
        data: contracts
      });
    } catch (error) {
      next(error);
    }
  }

  static async getContractById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contract = await KontrakService.getContractById(id);
      res.status(200).json({
        success: true,
        data: contract
      });
    } catch (error) {
      next(error);
    }
  }

  static async getContractsByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const contracts = await KontrakService.getContractsByEmployeeId(employeeId);
      res.status(200).json({
        success: true,
        data: contracts
      });
    } catch (error) {
      next(error);
    }
  }

  static async createContract(req: Request, res: Response, next: NextFunction) {
    try {
      const contractData = req.body;
      const newContract = await KontrakService.createContract(contractData);
      res.status(201).json({
        success: true,
        data: newContract
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contractData = req.body;
      const updatedContract = await KontrakService.updateContract(id, contractData);
      res.status(200).json({
        success: true,
        data: updatedContract
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await KontrakService.deleteContract(id);
      res.status(200).json({
        success: true,
        message: 'Contract deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExpiringContracts(req: Request, res: Response, next: NextFunction) {
    try {
      // Get the number of days from query parameter, default to 30
      const days = parseInt(req.query.days as string) || 30;
      const contracts = await KontrakService.getExpiringContracts(days);
      res.status(200).json({
        success: true,
        data: contracts
      });
    } catch (error) {
      next(error);
    }
  }

  // Job History (Riwayat Jabatan) Methods
  static async getRiwayatJabatan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // employeeId
      const riwayatJabatan = await KontrakService.getRiwayatJabatan(id);
      res.status(200).json({
        success: true,
        data: riwayatJabatan
      });
    } catch (error) {
      next(error);
    }
  }

  static async addRiwayatJabatan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // employeeId
      const riwayatJabatanData = req.body;
      const result = await KontrakService.addRiwayatJabatan(id, riwayatJabatanData);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default KontrakController;