export interface Notifikasi {
  id: string; // Backend likely returns numeric IDs
  employee_id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  scheduled_for?: string;
  delivery_channel: string;
  related_entity?: string;
  related_entity_id?: string;
}
