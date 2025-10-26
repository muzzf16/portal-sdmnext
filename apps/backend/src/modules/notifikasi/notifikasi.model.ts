
// src/modules/notifikasi/notifikasi.model.ts

export interface Notifikasi {
  id: string;
  employee_id: string;
  message: string;
  type: string; // e.g., 'info', 'warning', 'error', 'success'
  is_read: boolean;
  created_at: string;
  scheduled_for?: string; // For scheduled notifications
  delivery_channel: string; // e.g., 'in_app', 'email', 'sms'
  related_entity?: string; // e.g., 'contract', 'leave', 'payroll', 'performance'
  related_entity_id?: string; // ID of the related entity
}
