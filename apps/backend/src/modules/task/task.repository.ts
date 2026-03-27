import { openDb } from '../../config/db';
import { CreateTaskPayload, TaskItem, TaskStatus } from './task.types';

export const TaskRepository = {
    async create(data: CreateTaskPayload): Promise<TaskItem | null> {
        const db = await openDb();
        const id = data.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO assigned_tasks (id, supervisor_id, employee_id, task_name, description, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            id, data.supervisor_id, data.employee_id, data.task_name, data.description || '', 'pending', now, now
        );
        return this.findById(id);
    },

    async findById(id: string): Promise<TaskItem | null> {
        const db = await openDb();
        const row = await db.get(`
            SELECT t.*, 
                   e.name as employee_name, e.position as employee_position,
                   s.name as supervisor_name
            FROM assigned_tasks t
            JOIN pegawai e ON t.employee_id = e.id
            JOIN pegawai s ON t.supervisor_id = s.id
            WHERE t.id = ?
        `, id) as TaskItem | undefined;
        return row || null;
    },

    async findBySupervisorId(supervisor_id: string): Promise<TaskItem[]> {
        const db = await openDb();
        return db.all(`
            SELECT t.*, 
                   e.name as employee_name, e.position as employee_position
            FROM assigned_tasks t
            JOIN pegawai e ON t.employee_id = e.id
            WHERE t.supervisor_id = ?
            ORDER BY t.created_at DESC
        `, supervisor_id) as Promise<TaskItem[]>;
    },

    async findByEmployeeId(employee_id: string, status?: TaskStatus): Promise<TaskItem[]> {
        const db = await openDb();
        let query = `
            SELECT t.*, 
                   s.name as supervisor_name, s.position as supervisor_position
            FROM assigned_tasks t
            JOIN pegawai s ON t.supervisor_id = s.id
            WHERE t.employee_id = ?
        `;
        const params: string[] = [employee_id];

        if (status) {
            query += ` AND t.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY t.created_at DESC`;

        return db.all(query, ...params) as Promise<TaskItem[]>;
    },

    async updateStatus(id: string, status: TaskStatus): Promise<TaskItem | null> {
        const db = await openDb();
        const now = new Date().toISOString();
        await db.run(
            `UPDATE assigned_tasks SET status = ?, updated_at = ? WHERE id = ?`,
            status, now, id
        );
        return this.findById(id);
    },

    async delete(id: string) {
        const db = await openDb();
        await db.run(`DELETE FROM assigned_tasks WHERE id = ?`, id);
        return { success: true };
    }
};
