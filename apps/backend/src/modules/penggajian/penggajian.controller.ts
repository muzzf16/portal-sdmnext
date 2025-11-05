
import PenggajianService from './penggajian.service';
import { Request, Response, NextFunction } from 'express';

class PenggajianController {
  static async getAllPenggajian(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payrolls = await PenggajianService.getAllPenggajian();
      res.status(200).json(payrolls);
    } catch (error) {
      next(error);
    }
  }

  static async getPenggajianById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const payroll = await PenggajianService.getPenggajianById(id);
      res.status(200).json(payroll);
    } catch (error) {
      next(error);
    }
  }

  static async getPenggajianByEmployeeId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const payrolls = await PenggajianService.getPenggajianByEmployeeId(id);
      res.status(200).json(payrolls);
    } catch (error) {
      next(error);
    }
  }

  static async createPenggajian(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payrollData = req.body;
      const newPayroll = await PenggajianService.createPenggajian(payrollData);
      res.status(201).json(newPayroll);
    } catch (error) {
      next(error);
    }
  }

  static async updatePenggajian(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const payrollData = req.body;
      const updatedPayroll = await PenggajianService.updatePenggajian(id, payrollData);
      res.status(200).json(updatedPayroll);
    } catch (error) {
      next(error);
    }
  }

  static async deletePenggajian(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await PenggajianService.deletePenggajian(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async addSalaryComponent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const componentData = req.body;
      const updatedPayroll = await PenggajianService.addSalaryComponent(id, componentData);
      res.status(200).json(updatedPayroll);
    } catch (error) {
      next(error);
    }
  }

  static async runPayroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period } = req.body;
      if (!period) {
        res.status(400).json({ message: 'Period is required' });
        return;
      }
      const result = await PenggajianService.runPayroll(period);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async downloadPayslip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const payslipBuffer = await PenggajianService.generatePayslip(id); // This method needs to be created in the service

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=payslip-${id}.pdf`);
      res.send(payslipBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export default PenggajianController;
