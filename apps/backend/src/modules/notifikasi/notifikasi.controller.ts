import NotifikasiService from './notifikasi.service';
import { Request, Response, NextFunction } from 'express';

class NotifikasiController {
  static async getNotifikasiByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const notifications = await NotifikasiService.getNotifikasiByEmployeeId(employeeId);
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadNotifikasiByEmployeeId(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const notifications = await NotifikasiService.getUnreadNotifikasiByEmployeeId(employeeId);
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  static async createNotifikasi(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { message, type, delivery_channel, related_entity, related_entity_id, scheduled_for } = req.body;
      
      const notificationData = {
        employee_id: employeeId,
        message,
        type,
        delivery_channel,
        related_entity,
        related_entity_id,
        scheduled_for
      };
      
      const newNotification = await NotifikasiService.createNotifikasi(notificationData);
      res.status(201).json({
        success: true,
        data: newNotification
      });
    } catch (error) {
      next(error);
    }
  }

  static async markNotifikasiAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const result = await NotifikasiService.markNotifikasiAsRead(notificationId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Notification marked as read successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getScheduledNotifikasi(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await NotifikasiService.getScheduledNotifikasi();
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }
}

export default NotifikasiController;