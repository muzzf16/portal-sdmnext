
import PegawaiService from './pegawai.service';
import { AppError } from '../../utils/errors';
import { Request, Response, NextFunction } from 'express';

class PegawaiController {
  static async getAllPegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const pegawai = await PegawaiService.getAllPegawai();
      res.status(200).json(pegawai);
    } catch (error) {
      next(error);
    }
  }

  static async getPegawaiById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pegawai = await PegawaiService.getPegawaiById(id);
      res.status(200).json(pegawai);
    } catch (error) {
      next(error);
    }
  }

  static async createPegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, ...pegawaiData } = req.body;
      const newPegawai = await PegawaiService.createPegawai(name, email, pegawaiData);
      res.status(201).json(newPegawai);
    } catch (error) {
      next(error);
    }
  }

  static async updatePegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, ...pegawaiData } = req.body;
      const updatedPegawai = await PegawaiService.updatePegawai(id, name, email, pegawaiData);
      res.status(200).json(updatedPegawai);
    } catch (error) {
      next(error);
    }
  }

  static async deletePegawai(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PegawaiService.deletePegawai(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updatePegawaiPayrollInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payrollInfo = req.body;
      const result = await PegawaiService.updatePegawaiPayrollInfo(id, payrollInfo);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default PegawaiController;
