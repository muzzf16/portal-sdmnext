import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';


export const TaskController = {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const task = await TaskService.createTask(req.body);
            res.status(201).json({ success: true, message: 'Tugas berhasil dibuat', data: task });
        } catch (error) {
            next(error);
        }
    },

    async getBySupervisor(req: Request, res: Response, next: NextFunction) {
        try {
            const { supervisor_id } = req.params;
            const tasks = await TaskService.getTasksBySupervisor(supervisor_id);
            res.json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    },

    async getByEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const { employee_id } = req.params;
            const { status } = req.query;
            const tasks = await TaskService.getTasksByEmployee(employee_id, status as string);
            res.json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    },

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const task = await TaskService.updateTaskStatus(id, status);
            res.json({ success: true, message: 'Status tugas berhasil diupdate', data: task });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await TaskService.deleteTask(id);
            res.json({ success: true, message: 'Tugas berhasil dihapus' });
        } catch (error) {
            next(error);
        }
    }
};
