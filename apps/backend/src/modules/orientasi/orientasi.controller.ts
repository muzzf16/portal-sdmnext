import OrientasiService from './orientasi.service';
import { Request, Response, NextFunction } from 'express';

class OrientasiController {
  static async getTugasOrientasiByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const tasks = await OrientasiService.getTugasOrientasiByEmployeeId(employeeId);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  static async createTugasOrientasi(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const taskData = req.body;
      const newTask = await OrientasiService.createTugasOrientasi(employeeId, taskData);
      res.status(201).json(newTask);
    } catch (error) {
      next(error);
    }
  }

  static async updateTugasOrientasi(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const taskData = req.body;
      const updatedTask = await OrientasiService.updateTugasOrientasi(taskId, taskData);
      res.status(200).json(updatedTask);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTugasOrientasi(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const result = await OrientasiService.deleteTugasOrientasi(taskId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default OrientasiController;