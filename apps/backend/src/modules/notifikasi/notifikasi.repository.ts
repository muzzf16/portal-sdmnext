// src/modules/notifikasi/notifikasi.repository.ts
import { openDb } from '../../config/db';

// Helper to parse JSON fields from DB results (if any)
const parseJsonFields = (rows: any[]) => {
  return rows; // No JSON fields to parse in notifikasi model based on current data
};

export const NotifikasiRepository = {
  async findByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT id, employee_id, message, type, is_read, created_at, scheduled_for, delivery_channel, related_entity, related_entity_id FROM notifications WHERE employee_id = ? ORDER BY created_at DESC', employeeId);
    return parseJsonFields(rows);
  },

  async findUnreadByEmployeeId(employeeId: string) {
    const db = await openDb();
    const rows = await db.all('SELECT id, employee_id, message, type, is_read, created_at, scheduled_for, delivery_channel, related_entity, related_entity_id FROM notifications WHERE employee_id = ? AND is_read = 0 ORDER BY created_at DESC', employeeId);
    return parseJsonFields(rows);
  },

  async create(notificationData: { employee_id: string, message: string, type?: string, delivery_channel?: string, related_entity?: string, related_entity_id?: string, scheduled_for?: string }) {
    const db = await openDb();
    const { employee_id, message, type = 'info', delivery_channel = 'in_app', related_entity, related_entity_id, scheduled_for } = notificationData;
    const result = await db.run(
      `INSERT INTO notifications (employee_id, message, type, is_read, created_at, scheduled_for, delivery_channel, related_entity, related_entity_id) 
       VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)`,
      employee_id, message, type, 0, scheduled_for, delivery_channel, related_entity, related_entity_id
    );
    return { 
      id: result.lastID, 
      employee_id, 
      message, 
      type, 
      is_read: false, 
      created_at: new Date().toISOString(),
      scheduled_for,
      delivery_channel,
      related_entity,
      related_entity_id
    };
  },

  async markAsRead(notificationId: string) {
    const db = await openDb();
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', notificationId);
    return { id: notificationId, is_read: true };
  },

  async findScheduledNotifications() {
    const db = await openDb();
    // Get notifications that are scheduled for delivery and not yet sent
    const rows = await db.all(
      'SELECT id, employee_id, message, type, is_read, created_at, scheduled_for, delivery_channel, related_entity, related_entity_id FROM notifications WHERE scheduled_for IS NOT NULL AND scheduled_for <= datetime("now") AND is_read = 0'
    );
    return parseJsonFields(rows);
  }
};